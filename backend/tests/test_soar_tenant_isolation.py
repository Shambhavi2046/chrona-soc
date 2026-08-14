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
from app.middleware import auth
from app.db.session import get_db
from app.db.base_class import Base

# Tenant A
org_a_id = uuid.uuid4()
user_a_id = uuid.uuid4()

# Tenant B
org_b_id = uuid.uuid4()
user_b_id = uuid.uuid4()

super_admin_role = Role(name="Super Admin", permissions=[
    "soar:read", "soar:write", "soar:delete", "soar:execute"
])

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    user_a = User(
        id=user_a_id, email="a@tenant.local", name="User A", status="Active", org_id=org_a_id, roles=[super_admin_role], hashed_password="mock"
    )

    user_b = User(
        id=user_b_id, email="b@tenant.local", name="User B", status="Active", org_id=org_b_id, roles=[super_admin_role], hashed_password="mock"
    )

    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        session.add(Organization(id=org_a_id, name="Tenant A", status="Active"))
        session.add(Organization(id=org_b_id, name="Tenant B", status="Active"))
        session.add(user_a)
        session.add(user_b)
        await session.commit()
        yield session

def mock_verify_token(token: str):
    if token == "token_a":
        return {"sub": str(user_a_id)}
    elif token == "token_b":
        return {"sub": str(user_b_id)}
    raise ValueError("Invalid token")

@pytest_asyncio.fixture
async def async_client(db_session, monkeypatch):
    monkeypatch.setattr(auth, "verify_token", mock_verify_token)
    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

headers_a = {"Authorization": "Bearer token_a"}
headers_b = {"Authorization": "Bearer token_b"}

@pytest.mark.asyncio
async def test_soar_playbook_tenant_isolation(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Setup Phase: Create Playbooks for both tenants
    pb_a_res = await async_client.post("/api/v1/soar/playbooks", headers=headers_a, json={
        "name": "Playbook A",
        "description": "Tenant A Playbook",
        "category": "Testing",
        "trigger_type": "Manual",
        "status": "Disabled",
        "workflow_definition": {"actions": []}
    })
    assert pb_a_res.status_code == 200
    pb_a_id = pb_a_res.json()["id"]

    pb_b_res = await async_client.post("/api/v1/soar/playbooks", headers=headers_b, json={
        "name": "Playbook B",
        "description": "Tenant B Playbook",
        "category": "Testing",
        "trigger_type": "Manual",
        "status": "Disabled",
        "workflow_definition": {"actions": []}
    })
    assert pb_b_res.status_code == 200
    pb_b_id = pb_b_res.json()["id"]

    # Clear audit logs from setup to have a clean slate for assertions
    await db_session.execute(AuditLog.__table__.delete())
    await db_session.commit()

    # 2. Positive Control: Tenant A can access its own playbook
    res = await async_client.get(f"/api/v1/soar/playbooks/{pb_a_id}", headers=headers_a)
    assert res.status_code == 200
    assert res.json()["name"] == "Playbook A"

    # 3. Hostile IDOR Attacks: Tenant A attacks Tenant B's playbook
    # GET
    res = await async_client.get(f"/api/v1/soar/playbooks/{pb_b_id}", headers=headers_a)
    assert res.status_code == 404

    # UPDATE
    res = await async_client.put(f"/api/v1/soar/playbooks/{pb_b_id}", headers=headers_a, json={"description": "Malicious Update"})
    assert res.status_code == 404

    # ACTIVATE
    res = await async_client.patch(f"/api/v1/soar/playbooks/{pb_b_id}/activate", headers=headers_a)
    assert res.status_code == 404

    # DEACTIVATE
    res = await async_client.patch(f"/api/v1/soar/playbooks/{pb_b_id}/deactivate", headers=headers_a)
    assert res.status_code == 404

    # EXECUTE
    res = await async_client.post(f"/api/v1/soar/playbooks/{pb_b_id}/execute", headers=headers_a)
    assert res.status_code == 404

    # DELETE
    res = await async_client.delete(f"/api/v1/soar/playbooks/{pb_b_id}", headers=headers_a)
    assert res.status_code == 404

    # 4. Database-level Integrity Assertions
    # Verify Tenant B playbook remains completely untouched
    pb_b = await db_session.get(Playbook, uuid.UUID(pb_b_id))
    assert pb_b is not None
    assert pb_b.description == "Tenant B Playbook"
    assert pb_b.status == "Disabled"

    # 5. Audit Log Assertions
    # Ensure NO audit logs were created by the failed IDOR attacks
    audit_logs = (await db_session.execute(select(AuditLog))).scalars().all()
    assert len(audit_logs) == 0


@pytest.mark.asyncio
async def test_soar_execution_tenant_isolation(async_client: AsyncClient, db_session: AsyncSession):
    # Setup Playbooks
    pb_a_res = await async_client.post("/api/v1/soar/playbooks", headers=headers_a, json={
        "name": "Exec Playbook A",
        "description": "Desc",
        "category": "Testing",
        "trigger_type": "Manual",
        "status": "Active",
        "workflow_definition": {"actions": [{"type": "log", "config": {"message": "Wait"}}]}
    })
    assert pb_a_res.status_code == 200, pb_a_res.text
    pb_a_id = pb_a_res.json()["id"]

    pb_b_res = await async_client.post("/api/v1/soar/playbooks", headers=headers_b, json={
        "name": "Exec Playbook B",
        "description": "Desc",
        "category": "Testing",
        "trigger_type": "Manual",
        "status": "Active",
        "workflow_definition": {"actions": [{"type": "log", "config": {"message": "Wait"}}]}
    })
    assert pb_b_res.status_code == 200, pb_b_res.text
    pb_b_id = pb_b_res.json()["id"]

    # Setup Executions
    exec_a_res = await async_client.post(f"/api/v1/soar/playbooks/{pb_a_id}/execute", headers=headers_a)
    exec_a_id = exec_a_res.json()["id"]

    exec_b_res = await async_client.post(f"/api/v1/soar/playbooks/{pb_b_id}/execute", headers=headers_b)
    exec_b_id = exec_b_res.json()["id"]

    # Force statuses to Running for testing control operations
    exec_a_obj = await db_session.get(PlaybookExecution, uuid.UUID(exec_a_id))
    exec_a_obj.status = "Running"
    exec_b_obj = await db_session.get(PlaybookExecution, uuid.UUID(exec_b_id))
    exec_b_obj.status = "Running"
    await db_session.commit()

    # Clear setup audit logs
    await db_session.execute(AuditLog.__table__.delete())
    await db_session.commit()

    # Positive Control
    res = await async_client.get(f"/api/v1/soar/executions/{exec_a_id}", headers=headers_a)
    assert res.status_code == 200
    res = await async_client.post(f"/api/v1/soar/executions/{exec_a_id}/pause", headers=headers_a)
    assert res.status_code == 200

    # Hostile IDOR Attacks
    # GET
    res = await async_client.get(f"/api/v1/soar/executions/{exec_b_id}", headers=headers_a)
    assert res.status_code == 404

    # PAUSE
    res = await async_client.post(f"/api/v1/soar/executions/{exec_b_id}/pause", headers=headers_a)
    assert res.status_code == 404

    # RESUME (force status to Paused first)
    exec_b_obj = await db_session.get(PlaybookExecution, uuid.UUID(exec_b_id))
    exec_b_obj.status = "Paused"
    await db_session.commit()
    res = await async_client.post(f"/api/v1/soar/executions/{exec_b_id}/resume", headers=headers_a)
    assert res.status_code == 404

    # CANCEL
    res = await async_client.post(f"/api/v1/soar/executions/{exec_b_id}/cancel", headers=headers_a)
    assert res.status_code == 404

    # Database-level Integrity Assertions
    exec_b_check = await db_session.get(PlaybookExecution, uuid.UUID(exec_b_id))
    assert exec_b_check.status == "Paused" # Unchanged by Tenant A's resume/cancel

    # Audit Log Assertions
    # We expect 1 audit log from Tenant A's positive control (execution.pause)
    audit_logs = (await db_session.execute(select(AuditLog))).scalars().all()
    assert len(audit_logs) == 1
    assert audit_logs[0].org_id == org_a_id
    assert audit_logs[0].action == "execution.pause"
