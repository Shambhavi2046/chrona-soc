import pytest
import pytest_asyncio
import httpx
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
    "dashboard:read",
    "hunting:read", "hunting:write", "hunting:delete",
    "reports:read", "reports:write", "reports:delete",
    "graph:read"
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

def switch_user(user):
    global current_mock_user
    current_mock_user = user

@pytest.mark.asyncio
async def test_dashboard_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    resp1 = await async_client.get("/api/v1/dashboard/summary")
    assert resp1.status_code == 200
    
    switch_user(user_b)
    resp2 = await async_client.get("/api/v1/dashboard/summary")
    assert resp2.status_code == 200

    metrics1 = await async_client.get("/api/v1/dashboard/metrics")
    assert metrics1.status_code == 200

@pytest.mark.asyncio
async def test_hunting_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    create_payload = {
        "name": "Org1 Hunt",
        "description": "Test hunt",
        "query": "process_name == 'cmd.exe'",
        "author": "tester"
    }
    resp1 = await async_client.post("/api/v1/hunting/saved", json=create_payload)
    assert resp1.status_code == 200
    hunt_id = resp1.json()["id"]

    switch_user(user_b)
    resp2 = await async_client.get("/api/v1/hunting/saved")
    assert resp2.status_code == 200
    org2_hunts = resp2.json()
    assert hunt_id not in [h["id"] for h in org2_hunts]

    resp3 = await async_client.delete(f"/api/v1/hunting/saved/{hunt_id}")
    assert resp3.status_code == 404

    switch_user(user_a)
    resp4 = await async_client.delete(f"/api/v1/hunting/saved/{hunt_id}")
    assert resp4.status_code == 200

@pytest.mark.asyncio
async def test_analytics_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    resp1 = await async_client.get("/api/v1/analytics")
    assert resp1.status_code == 200
    data = resp1.json()
    assert "kpis" in data

@pytest.mark.asyncio
async def test_attack_graph_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    resp1 = await async_client.get("/api/v1/graph")
    assert resp1.status_code == 200
    data = resp1.json()
    assert "nodes" in data
    assert "edges" in data

@pytest.mark.asyncio
async def test_reports_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    resp1 = await async_client.get("/api/v1/reports/templates")
    assert resp1.status_code == 200
    
    gen_payload = {
        "name": "Test Report",
        "source_type": "Alert",
        "source_id": "1",
        "generated_by": "tester"
    }
    resp2 = await async_client.post("/api/v1/reports/generate", json=gen_payload)
    assert resp2.status_code == 200
    report_id = resp2.json()["id"]

    switch_user(user_b)
    resp3 = await async_client.get(f"/api/v1/reports/{report_id}/export/json")
    assert resp3.status_code == 404

    resp4 = await async_client.get(f"/api/v1/reports/{report_id}/export/pdf")
    assert resp4.status_code == 404

    resp5 = await async_client.delete(f"/api/v1/reports/{report_id}")
    assert resp5.status_code == 404
