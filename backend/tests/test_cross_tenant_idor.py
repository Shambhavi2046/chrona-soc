import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
import asyncio
from app.main import app
from app.models.identity import User, Role, Organization
from app.middleware.auth import get_current_user
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.db.base_class import Base

# Setup organizations
org_a_id = uuid.uuid4()
org_b_id = uuid.uuid4()

# Setup users
user_a_id = uuid.uuid4()
user_b_id = uuid.uuid4()

super_admin_role = Role(name="Super Admin", permissions=[
    "alerts:read", "alerts:write", "alerts:delete",
    "cases:read", "cases:write", "cases:delete",
    "soar:read", "soar:write", "soar:delete", "soar:execute"
])

user_a = User(
    id=user_a_id, email="user_a@org_a.local", name="User A", status="Active", org_id=org_a_id, roles=[super_admin_role], hashed_password="mock"
)
user_b = User(
    id=user_b_id, email="user_b@org_b.local", name="User B", status="Active", org_id=org_b_id, roles=[super_admin_role], hashed_password="mock"
)

current_mock_user = user_a

async def mock_get_current_user():
    return current_mock_user

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        # Pre-seed organizations just in case any foreign key constraints require them
        session.add(Organization(id=org_a_id, name="Org A", status="Active"))
        session.add(Organization(id=org_b_id, name="Org B", status="Active"))
        session.add(user_a)
        session.add(user_b)
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
async def test_cross_tenant_idor_alerts(async_client: AsyncClient, db_session: AsyncSession):
    global current_mock_user

    # User A creates an alert
    current_mock_user = user_a
    alert_payload = {
        "title": "Org A Alert",
        "severity": "High",
        "status": "Open",
        "source": "Sentinel"
    }
    resp = await async_client.post("/api/v1/alerts", json=alert_payload)
    assert resp.status_code == 200
    alert_id = resp.json()["id"]

    # User B attempts to access User A's alert (GET)
    current_mock_user = user_b
    resp = await async_client.get(f"/api/v1/alerts/{alert_id}")
    assert resp.status_code == 404 # Should be isolated

    # User B attempts to update User A's alert (PATCH)
    resp = await async_client.patch(f"/api/v1/alerts/{alert_id}", json={"status": "Closed"})
    assert resp.status_code == 404

    # User B attempts to list alerts
    resp = await async_client.get("/api/v1/alerts")
    assert resp.status_code == 200
    assert len(resp.json()) == 0 # User B should see 0 alerts

@pytest.mark.asyncio
async def test_cross_tenant_idor_credentials(async_client: AsyncClient, db_session: AsyncSession):
    global current_mock_user

    # User A creates a credential
    current_mock_user = user_a
    cred_payload = {
        "name": "Org A Cred",
        "provider": "threatfox",
        "secret": "secret123"
    }
    resp = await async_client.post("/api/v1/soar/credentials", json=cred_payload)
    assert resp.status_code == 200
    cred_id = resp.json()["id"]

    # User B attempts to delete User A's credential
    current_mock_user = user_b
    resp = await async_client.delete(f"/api/v1/soar/credentials/{cred_id}")
    assert resp.status_code == 404 # Should be isolated

    # User B attempts to list credentials
    resp = await async_client.get("/api/v1/soar/credentials")
    assert resp.status_code == 200
    assert len(resp.json()) == 0

@pytest.mark.asyncio
async def test_cross_tenant_idor_playbooks(async_client: AsyncClient, db_session: AsyncSession):
    global current_mock_user

    # User A creates a playbook
    current_mock_user = user_a
    pb_payload = {
        "name": "Org A Playbook",
        "description": "Test",
        "category": "Test",
        "trigger_type": "Manual",
        "status": "Active",
        "workflow_definition": {"nodes": []}
    }
    resp = await async_client.post("/api/v1/soar/playbooks", json=pb_payload)
    assert resp.status_code == 200
    pb_id = resp.json()["id"]

    # User B attempts to get User A's playbook
    current_mock_user = user_b
    resp = await async_client.get(f"/api/v1/soar/playbooks/{pb_id}")
    assert resp.status_code == 404

    # User B attempts to execute User A's playbook
    resp = await async_client.post(f"/api/v1/soar/playbooks/{pb_id}/execute")
    assert resp.status_code == 404

    # User B attempts to update User A's playbook
    resp = await async_client.put(f"/api/v1/soar/playbooks/{pb_id}", json=pb_payload)
    assert resp.status_code == 404

@pytest.mark.asyncio
async def test_soar_playbook_background_credential_idor(async_client: AsyncClient, db_session: AsyncSession):
    global current_mock_user

    # 1. Tenant A creates Credential
    current_mock_user = user_a
    cred_payload = {
        "name": "Org A Cred",
        "provider": "threatfox",
        "secret": "secret123"
    }
    resp = await async_client.post("/api/v1/soar/credentials", json=cred_payload)
    assert resp.status_code == 200
    cred_id = resp.json()["id"]

    # 2. Directly test IntegrationActionHandler with Tenant B context
    from app.services.soar.context import ExecutionContext
    from app.services.soar.actions import IntegrationActionHandler

    # Tenant B Context
    context = ExecutionContext("exec-1", "pb-1", "User B", org_id=org_b_id)
    handler = IntegrationActionHandler()

    # Needs to mock async_session_maker to use test DB
    import app.services.soar.actions
    class MockSessionMaker:
        async def __aenter__(self):
            return db_session
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass
    app.services.soar.actions.async_session_maker = lambda: MockSessionMaker()

    # Execute action
    config = {
        "integration": "threatfox",
        "credential_id": cred_id,
        "query": "test"
    }

    res = await handler._execute_async(context, config)
    assert res["status"] == "failed"
    assert "Credential not found" in res["message"]

@pytest.mark.asyncio
async def test_case_assignee_cross_tenant_lookup(async_client: AsyncClient, db_session: AsyncSession):
    global current_mock_user

    # Create identical User in Tenant B (already exists as user_b: "User B")
    # Let's create a User in Tenant B with name "Shared Admin Name"
    user_b_shared = User(
        id=uuid.uuid4(), email="shared_b@org_b.local", name="Shared Admin Name", status="Active", org_id=org_b_id, roles=[super_admin_role], hashed_password="mock"
    )
    db_session.add(user_b_shared)

    # Create User in Tenant A with the EXACT same name "Shared Admin Name"
    user_a_shared = User(
        id=uuid.uuid4(), email="shared_a@org_a.local", name="Shared Admin Name", status="Active", org_id=org_a_id, roles=[super_admin_role], hashed_password="mock"
    )
    db_session.add(user_a_shared)
    await db_session.commit()

    # 1. Tenant A creates Case
    current_mock_user = user_a
    case_payload = {
        "title": "Tenant A Case",
        "description": "Test Case",
        "priority": "High",
        "severity": "High"
    }
    resp = await async_client.post("/api/v1/cases", json=case_payload)
    assert resp.status_code == 200
    case_id = resp.json()["id"]

    # 2. Assign case by name
    resp = await async_client.patch(f"/api/v1/cases/{case_id}", json={"assignee": "Shared Admin Name"})
    assert resp.status_code == 200

    # Verify the case got assigned to Tenant A's user, NOT Tenant B's user
    assert resp.json()["assignee_id"] == str(user_a_shared.id)

    # 3. Try to assign case to a name that ONLY exists in Tenant B (e.g. "User B")
    resp = await async_client.patch(f"/api/v1/cases/{case_id}", json={"assignee": "User B"})
    assert resp.status_code == 400
    assert "not found" in resp.json()["detail"].lower()
