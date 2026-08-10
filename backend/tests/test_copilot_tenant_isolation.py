import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base_class import Base
from app.main import app
from app.middleware.auth import get_current_user
from app.models.identity import Organization, User, Role
from app.models.operations import Case
from app.api.routes import copilot

# 1. Create a synchronous test engine and sessionmaker
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    echo=False
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest_asyncio.fixture
def sync_db_session():
    # Setup tables
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest_asyncio.fixture
async def async_client(sync_db_session):
    # Override the Copilot route's specific get_db dependency
    # with our isolated synchronous test session
    def override_get_db():
        yield sync_db_session
        
    app.dependency_overrides[copilot.get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_copilot_tenant_isolation(async_client: AsyncClient, sync_db_session):
    primary_org_id = uuid.uuid4()
    secondary_org_id = uuid.uuid4()
    
    # 4. Create two organizations and at least one Case belonging to each organization.
    org1 = Organization(id=primary_org_id, name="Org 1")
    org2 = Organization(id=secondary_org_id, name="Org 2")
    sync_db_session.add(org1)
    sync_db_session.add(org2)
    
    # Insert cases. Copilot searches for Critical/High priority if case context fails.
    c1 = Case(title="Org 1 Secret Case", severity="High", priority="High", org_id=primary_org_id)
    c2 = Case(title="Org 2 Secret Case", severity="High", priority="High", org_id=secondary_org_id)
    sync_db_session.add(c1)
    sync_db_session.add(c2)
    
    sync_db_session.commit()
    sync_db_session.refresh(c1)
    sync_db_session.refresh(c2)
    
    case_id_org_1 = c1.id
    case_id_org_2 = c2.id
    
    # 5. Authenticate the simulated user as an Org 1 user with 'cases:read'
    async def mock_get_current_user():
        return User(
            id=uuid.uuid4(), 
            email="test@chrona.local", 
            name="Test User", 
            org_id=primary_org_id,
            roles=[Role(name="Super Admin", permissions=["cases:read"])]
        )
    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 6. Verify Org 1 user can successfully request information about the Org 1 case.
    payload = {"prompt": f"Summarize CASE-{case_id_org_1}", "history": []}
    res = await async_client.post("/api/v1/copilot/chat", json=payload)
    
    assert res.status_code == 200, f"Failed with {res.status_code}: {res.text}"
    data = res.json()
    assert "Org 1 Secret Case" in data["response"] or "Incident Summary" in data["response"]
    
    # 7 & 8. Verify Org 1 user CANNOT retrieve, summarize, or expose the Org 2 case.
    # The cross-tenant assertion must specifically prove Org 2 case data/title is NOT present.
    payload2 = {"prompt": f"Summarize CASE-{case_id_org_2}", "history": []}
    res2 = await async_client.post("/api/v1/copilot/chat", json=payload2)
    data2 = res2.json()
    
    # The Copilot logic falls back to summarizing a recent authorized high priority case 
    # if the requested case_id is inaccessible. We must assert that Org 2 case data is absent.
    assert "Org 2 Secret Case" not in data2["response"], "Org 2 case data leaked across tenant boundaries!"
