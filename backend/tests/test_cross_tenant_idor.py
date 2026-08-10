import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
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
    id=user_a_id, email="user_a@org_a.local", name="User A", status="Active", org_id=org_a_id, roles=[super_admin_role]
)
user_b = User(
    id=user_b_id, email="user_b@org_b.local", name="User B", status="Active", org_id=org_b_id, roles=[super_admin_role]
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
        "definition": {"nodes": []}
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
