import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base_class import Base
from app.main import app
from app.middleware.auth import get_current_user
from app.models.identity import Organization, User, Role as DBRole
from app.core.roles import Role, ROLE_PERMISSIONS_MAPPING
from app.models.event_model import SecurityEvent

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    echo=False
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest_asyncio.fixture
def sync_db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest_asyncio.fixture
async def async_client(sync_db_session):
    from app.api.v1 import hunting
    app.dependency_overrides[hunting.get_db] = lambda: sync_db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_hunting_copilot_rbac(async_client: AsyncClient, sync_db_session):
    org_id = uuid.uuid4()
    org1 = Organization(id=org_id, name="Org 1")
    sync_db_session.add(org1)

    event_id = uuid.uuid4()
    from datetime import datetime
    event_id_str = "evt-1"
    event = SecurityEvent(id=event_id, tenant_id=org_id, event_id=event_id_str, timestamp=datetime.utcnow(), event_type="Logon", source="Windows", severity="High", raw_event="{}")
    sync_db_session.add(event)
    sync_db_session.commit()

    # Mock the service to avoid AsyncSession issues with the sync test engine
    from unittest.mock import patch, AsyncMock
    with patch("app.services.hunting_service.hunting_service.ask_copilot", new_callable=AsyncMock) as mock_ask_copilot:
        mock_ask_copilot.return_value = {"analysis": "Mock analysis"}

        # 1. Test Authorized User (THREAT_HUNTER)
        async def mock_auth_user():
            return User(
                id=uuid.uuid4(), email="auth@chrona.local", name="Auth User", org_id=org_id,
                roles=[DBRole(name=Role.THREAT_HUNTER.value, permissions=ROLE_PERMISSIONS_MAPPING[Role.THREAT_HUNTER])]
            )

        app.dependency_overrides[get_current_user] = mock_auth_user
        res = await async_client.post(f"/api/v1/hunting/copilot/{event_id}")
        assert res.status_code == 200, f"Authorized user should succeed, got {res.status_code}"

        # 2. Test Unauthorized Authenticated User (READ_ONLY missing permission)
        async def mock_unauth_user():
            return User(
                id=uuid.uuid4(), email="unauth@chrona.local", name="Unauth User", org_id=org_id,
                roles=[DBRole(name=Role.READ_ONLY.value, permissions=ROLE_PERMISSIONS_MAPPING[Role.READ_ONLY])]
            )
        app.dependency_overrides[get_current_user] = mock_unauth_user
        res = await async_client.post(f"/api/v1/hunting/copilot/{event_id}")
        assert res.status_code == 403, f"Unauthorized user should get 403, got {res.status_code}"

        # 3. Test Unauthenticated User
        app.dependency_overrides.pop(get_current_user, None)
        res = await async_client.post(f"/api/v1/hunting/copilot/{event_id}")
        assert res.status_code == 401, f"Unauthenticated user should get 401, got {res.status_code}"

@pytest.mark.asyncio
async def test_hunting_execute_rbac(async_client: AsyncClient, sync_db_session):
    org_id = uuid.uuid4()

    from unittest.mock import patch, AsyncMock
    with patch("app.services.hunting_service.hunting_service.execute_hunt", new_callable=AsyncMock) as mock_execute_hunt:
        mock_execute_hunt.return_value = {"events": [], "total": 0, "page": 1, "page_size": 10}

        async def check_role_access(role_enum, expected_status):
            async def mock_user():
                return User(
                    id=uuid.uuid4(), email="test@chrona.local", name="Test", org_id=org_id,
                    roles=[DBRole(name=role_enum.value, permissions=ROLE_PERMISSIONS_MAPPING[role_enum])]
                )
            app.dependency_overrides[get_current_user] = mock_user
            res = await async_client.post("/api/v1/hunting/execute", json={"page": 1, "page_size": 10, "query": "test"})
            assert res.status_code == expected_status, f"Role {role_enum.name} expected {expected_status}, got {res.status_code}"

        await check_role_access(Role.READ_ONLY, 403)
        await check_role_access(Role.TIER_1_ANALYST, 403)
        await check_role_access(Role.TIER_2_ANALYST, 200)
        await check_role_access(Role.THREAT_HUNTER, 200)
        await check_role_access(Role.SOC_MANAGER, 200)
        await check_role_access(Role.SUPER_ADMIN, 200)
