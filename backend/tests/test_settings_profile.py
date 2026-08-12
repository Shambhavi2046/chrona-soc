import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.identity import User, Organization
from app.middleware.auth import get_current_user
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, make_transient
from app.db.base_class import Base
from sqlalchemy import select

org_id = uuid.uuid4()
user_id = uuid.uuid4()

user_mock = User(
    id=user_id, email="test@local.com", name="Original Name", status="Active", org_id=org_id, hashed_password="mock", is_deleted=False
)

async def mock_get_current_user():
    return user_mock

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        make_transient(user_mock)
        session.add(Organization(id=org_id, name="Org", status="Active"))
        session.add(user_mock)
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
async def test_get_my_profile(async_client: AsyncClient):
    response = await async_client.get("/api/v1/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@local.com"
    assert data["name"] == "Original Name"
    assert "org_id" in data

@pytest.mark.asyncio
async def test_update_my_profile_success(async_client: AsyncClient, db_session: AsyncSession):
    new_name = "Updated Profile Name"
    response = await async_client.patch("/api/v1/users/me", json={"name": new_name})
    assert response.status_code == 200
    assert response.json()["name"] == new_name

    # Verify persistence
    await db_session.refresh(user_mock)
    assert user_mock.name == new_name

@pytest.mark.asyncio
async def test_update_my_profile_rejects_admin_fields(async_client: AsyncClient):
    response = await async_client.patch(
        "/api/v1/users/me",
        json={
            "name": "Should Fail",
            "org_id": "00000000-0000-0000-0000-000000000000",
            "status": "Admin",
            "role_ids": ["00000000-0000-0000-0000-000000000000"]
        }
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_unauthenticated_access_rejected(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    # Do not mock get_current_user here
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        response = await c.get("/api/v1/users/me")
        assert response.status_code == 401
    app.dependency_overrides.clear()
