import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base_class import Base
from app.db.session import get_db
from app.middleware.auth import get_current_user
from app.models.identity import User, Organization, Role
from app.models.operations import IOC

org_a_id = uuid.uuid4()
org_b_id = uuid.uuid4()

super_admin_role = Role(name="Super Admin", permissions=["threat_intel:read", "threat_intel:write"])
read_only_role = Role(name="Read Only", permissions=["alerts:read"]) # missing threat intel permissions

user_org_a = User(
    id=uuid.uuid4(),
    email="userA@orga.com",
    hashed_password="pw",
    org_id=org_a_id,
    roles=[super_admin_role],
    status="Active"
)

user_org_b = User(
    id=uuid.uuid4(),
    email="userB@orgb.com",
    hashed_password="pw",
    org_id=org_b_id,
    roles=[super_admin_role],
    status="Active"
)

user_no_perms = User(
    id=uuid.uuid4(),
    email="userC@orga.com",
    hashed_password="pw",
    org_id=org_a_id,
    roles=[read_only_role],
    status="Active"
)

current_mock_user = user_org_a

def mock_get_current_user():
    return current_mock_user

def switch_user(user):
    global current_mock_user
    current_mock_user = user

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

@pytest.mark.asyncio
async def test_auth_required():
    app.dependency_overrides.clear() # clear overrides for this test
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        response = await c.get("/api/v1/threat-intel/iocs")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_rbac_denial(async_client):
    switch_user(user_no_perms)
    response = await async_client.get("/api/v1/threat-intel/iocs")
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_ioc_isolation(async_client, db_session):
    # Setup data
    ioc_a = IOC(id=uuid.uuid4(), type="IP", value="1.1.1.1", org_id=org_a_id, status="Active", confidence=90)
    ioc_b = IOC(id=uuid.uuid4(), type="IP", value="2.2.2.2", org_id=org_b_id, status="Active", confidence=80)
    ioc_global = IOC(id=uuid.uuid4(), type="IP", value="8.8.8.8", org_id=None, status="Active", confidence=100)
    
    db_session.add_all([ioc_a, ioc_b, ioc_global])
    await db_session.commit()

    switch_user(user_org_a)
    response = await async_client.get("/api/v1/threat-intel/iocs")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    values = [i["value"] for i in data]
    assert "1.1.1.1" in values # Tenant A
    assert "8.8.8.8" in values # Global
    assert "2.2.2.2" not in values # Tenant B isolated
    
    # Test Stats
    response = await async_client.get("/api/v1/threat-intel/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["activeThreats"] == 2
    assert stats["criticalIndicators"] == 2 # 90 and 100

@pytest.mark.asyncio
async def test_ioc_search(async_client, db_session):
    ioc1 = IOC(id=uuid.uuid4(), type="Domain", value="evil.com", category="Phishing", org_id=org_a_id)
    ioc2 = IOC(id=uuid.uuid4(), type="Hash", value="deadbeef", category="Malware", org_id=org_a_id)
    db_session.add_all([ioc1, ioc2])
    await db_session.commit()
    
    switch_user(user_org_a)
    
    # Search by value
    response = await async_client.get("/api/v1/threat-intel/iocs?search=evil")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["value"] == "evil.com"
    
    # Search by category
    response = await async_client.get("/api/v1/threat-intel/iocs?search=Malware")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["value"] == "deadbeef"
