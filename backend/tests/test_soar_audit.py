import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.models.identity import User, Role, Organization, AuditLog
from app.models.automation import Playbook, PlaybookExecution
from app.middleware.auth import get_current_user, require_permissions
from app.db.session import get_db
from app.db.base_class import Base

org_id = uuid.uuid4()
user_id = uuid.uuid4()

super_admin_role = Role(name="Super Admin", permissions=[
    "soar:read", "soar:write", "soar:delete", "soar:execute"
])

current_mock_user = User(
    id=user_id, email="test@chrona.local", name="Test User", status="Active", org_id=org_id, roles=[super_admin_role], hashed_password="mock"
)

async def mock_get_current_user():
    return current_mock_user

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        session.add(Organization(id=org_id, name="Org A", status="Active"))
        session.add(current_mock_user)
        await session.commit()
        yield session

@pytest_asyncio.fixture
async def async_client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_current_user] = mock_get_current_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_soar_audit_playbook_lifecycle(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Create Playbook
    res = await async_client.post("/api/v1/soar/playbooks", json={
        "name": "Audit Test Playbook",
        "description": "Desc",
        "category": "Testing",
        "trigger_type": "Manual",
        "status": "Disabled",
        "workflow_definition": {"actions": []}
    })
    assert res.status_code == 200
    playbook_id = res.json()["id"]

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "playbook.create"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].user_id == user_id
    assert audit_logs[0].org_id == org_id
    assert audit_logs[0].resource == "Playbook"
    assert audit_logs[0].details["resource_id"] == playbook_id

    # 2. Update Playbook
    res = await async_client.put(f"/api/v1/soar/playbooks/{playbook_id}", json={
        "description": "Updated Desc"
    })
    assert res.status_code == 200

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "playbook.update"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].details["resource_id"] == playbook_id

    # 3. Activate Playbook
    res = await async_client.patch(f"/api/v1/soar/playbooks/{playbook_id}/activate")
    assert res.status_code == 200

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "playbook.activate"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].details["resource_id"] == playbook_id

    # 4. Deactivate Playbook
    res = await async_client.patch(f"/api/v1/soar/playbooks/{playbook_id}/deactivate")
    assert res.status_code == 200

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "playbook.deactivate"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].details["resource_id"] == playbook_id

    # 5. Delete Playbook
    res = await async_client.delete(f"/api/v1/soar/playbooks/{playbook_id}")
    assert res.status_code == 200

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "playbook.delete"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].details["resource_id"] == playbook_id

    # 6. Delete Non-existent Playbook (Should NOT audit)
    res = await async_client.delete(f"/api/v1/soar/playbooks/{playbook_id}")
    assert res.status_code == 404
    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "playbook.delete"))).scalars().all()
    assert len(audit_logs) == 1 # Still 1, did not increment


@pytest.mark.asyncio
async def test_soar_audit_execution_lifecycle(async_client: AsyncClient, db_session: AsyncSession):
    # Setup Playbook
    res = await async_client.post("/api/v1/soar/playbooks", json={
        "name": "Audit Exec Playbook",
        "description": "Desc",
        "category": "Testing",
        "trigger_type": "Manual",
        "status": "Active",
        "workflow_definition": {"actions": [{"type": "log", "config": {"message": "Wait"}}]}
    })
    playbook_id = res.json()["id"]

    # 1. Execute Playbook
    res = await async_client.post(f"/api/v1/soar/playbooks/{playbook_id}/execute")
    assert res.status_code == 200
    execution_id = res.json()["id"]

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "playbook.execute"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].resource == "Playbook"
    assert audit_logs[0].details["resource_id"] == playbook_id
    assert audit_logs[0].details["execution_id"] == execution_id

    # Force status for testing
    exec_obj = await db_session.get(PlaybookExecution, uuid.UUID(execution_id))
    exec_obj.status = "Running"
    await db_session.commit()

    # 2. Pause Execution
    res = await async_client.post(f"/api/v1/soar/executions/{execution_id}/pause")
    assert res.status_code == 200

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "execution.pause"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].resource == "PlaybookExecution"
    assert audit_logs[0].details["resource_id"] == execution_id
    assert audit_logs[0].details["playbook_id"] == playbook_id

    # 3. Resume Execution
    res = await async_client.post(f"/api/v1/soar/executions/{execution_id}/resume")
    assert res.status_code == 200

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "execution.resume"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].details["resource_id"] == execution_id

    # 4. Cancel Execution
    res = await async_client.post(f"/api/v1/soar/executions/{execution_id}/cancel")
    assert res.status_code == 200

    audit_logs = (await db_session.execute(select(AuditLog).where(AuditLog.action == "execution.cancel"))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].details["resource_id"] == execution_id
