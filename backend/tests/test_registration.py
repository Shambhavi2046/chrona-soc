import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.db.base_class import Base
from app.main import app
from app.db.session import get_db
from app.models.identity import User, Organization, UserRole, Role
from app.core.roles import Role as RoleEnum
from app.core.security import verify_password
import uuid

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        # Pre-seed system roles needed for registration
        session.add(Role(id=uuid.uuid4(), name=RoleEnum.SUPER_ADMIN.value, permissions=[]))
        await session.commit()
        yield session

@pytest_asyncio.fixture
async def async_client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_successful_registration(async_client: AsyncClient, db_session):
    payload = {
        "name": "Jane Doe",
        "email": "jane@acme.com",
        "password": "SecurePassword123!",
        "org_name": "Acme Corp Registration Test"
    }

    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "jane@acme.com"
    assert data["name"] == "Jane Doe"
    assert "id" in data
    assert "org_id" in data

    # Verify User is created
    result = await db_session.execute(select(User).filter(User.email == "jane@acme.com"))
    user = result.scalars().first()
    assert user is not None
    assert verify_password("SecurePassword123!", user.hashed_password)

    # Verify Organization is created
    result = await db_session.execute(select(Organization).filter(Organization.name == "Acme Corp Registration Test"))
    org = result.scalars().first()
    assert org is not None
    assert str(user.org_id) == str(org.id)

    # Verify Role is Super Admin (Tenant Admin)
    from app.repositories.role import role_repo
    super_admin_role = await role_repo.get_by_name(db_session, RoleEnum.SUPER_ADMIN.value)
    
    result = await db_session.execute(select(UserRole).filter(UserRole.user_id == user.id))
    user_roles = result.scalars().all()
    assert len(user_roles) == 1
    assert str(user_roles[0].role_id) == str(super_admin_role.id)

@pytest.mark.asyncio
async def test_duplicate_email_registration(async_client: AsyncClient, db_session):
    # Register once
    payload = {
        "name": "Jane Duplicate",
        "email": "duplicate@acme.com",
        "password": "SecurePassword123!",
        "org_name": "Acme Corp Duplicate Email Test"
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200

    # Register again with same email, different org
    payload2 = {
        "name": "Jane Duplicate 2",
        "email": "duplicate@acme.com",
        "password": "SecurePassword123!",
        "org_name": "Acme Corp Duplicate Email Test 2"
    }
    response2 = await async_client.post("/api/v1/auth/register", json=payload2)
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"]

    # Verify second org was NOT created (rollback works)
    result = await db_session.execute(select(Organization).filter(Organization.name == "Acme Corp Duplicate Email Test 2"))
    org = result.scalars().first()
    assert org is None

@pytest.mark.asyncio
async def test_duplicate_org_registration(async_client: AsyncClient, db_session):
    # Register once
    payload = {
        "name": "Jane Org 1",
        "email": "org1@acme.com",
        "password": "SecurePassword123!",
        "org_name": "Acme Corp Duplicate Org Test"
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200

    # Register again with different email, same org
    payload2 = {
        "name": "Jane Org 2",
        "email": "org2@acme.com",
        "password": "SecurePassword123!",
        "org_name": "Acme Corp Duplicate Org Test"
    }
    response2 = await async_client.post("/api/v1/auth/register", json=payload2)
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"]
