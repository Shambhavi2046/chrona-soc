import pytest
from httpx import AsyncClient
from app.main import app
from app.db.session import async_session_maker
from app.models.identity import UserSession
from sqlalchemy.future import select
from app.core.security import get_password_hash

# Note: We rely on the existing pytest-asyncio and database fixtures.
import pytest_asyncio
from app.db.base_class import Base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import get_db

import uuid
from app.models.identity import Organization, Role

org_id = uuid.uuid4()
super_admin_role_id = uuid.uuid4()

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        session.add(Organization(id=org_id, name="Test Org", status="Active"))
        session.add(Role(id=super_admin_role_id, name="Super Admin", permissions=["users:read", "users:write"]))
        await session.commit()
        yield session

@pytest_asyncio.fixture
async def async_client(db_session):
    from httpx import AsyncClient, ASGITransport
    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def auth_test_user(db_session):
    from app.models.identity import User, UserRole
    user_id = uuid.uuid4()
    
    user = User(
        id=user_id,
        email="test_auth@chrona.local",
        name="Auth Tester",
        hashed_password=get_password_hash("TestPass123!"),
        org_id=org_id,
        status="Active"
    )
    db_session.add(user)
    db_session.add(UserRole(user_id=user_id, role_id=super_admin_role_id))
    await db_session.commit()
    
    yield user
    
    # Cleanup
    await db_session.delete(user)
    await db_session.commit()

@pytest.mark.asyncio
async def test_a_login_valid_credentials(async_client: AsyncClient, auth_test_user):
    # Test A - Login
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "test_auth@chrona.local", "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    
    # Refresh token should be in cookies and response payload (as per current app design)
    assert "refresh_token" in response.cookies or "refresh_token" in data

@pytest.mark.asyncio
async def test_b_valid_refresh(async_client: AsyncClient, auth_test_user, db_session):
    # Test B - Valid Refresh
    # Login first
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "test_auth@chrona.local", "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert login_resp.status_code == 200
    
    # Extract refresh token
    refresh_token = login_resp.cookies.get("refresh_token") or login_resp.json().get("refresh_token")
    
    import asyncio
    await asyncio.sleep(1)
    
    # Refresh
    async_client.cookies.set("refresh_token", refresh_token)
    refresh_resp = await async_client.post("/api/v1/auth/refresh")
    
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()
    # Ensure it's a new token
    assert refresh_resp.json()["access_token"] != login_resp.json()["access_token"]

@pytest.mark.asyncio
async def test_c_expired_refresh_token(async_client: AsyncClient, auth_test_user):
    # Test C - Expired Refresh Token
    # Generate an explicitly expired refresh token
    from app.core.security import create_refresh_token
    from datetime import timedelta
    expired_token = create_refresh_token(subject=str(auth_test_user.id), expires_delta=timedelta(seconds=-1))
    
    async_client.cookies.set("refresh_token", expired_token)
    refresh_resp = await async_client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 401

@pytest.mark.asyncio
async def test_d_invalid_refresh_token(async_client: AsyncClient, auth_test_user):
    # Test D - Invalid Refresh Token
    async_client.cookies.set("refresh_token", "invalid.token.string")
    refresh_resp = await async_client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 401

@pytest.mark.asyncio
async def test_e_access_token_used_as_refresh(async_client: AsyncClient, auth_test_user):
    # Test E - Access Token used as Refresh
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "test_auth@chrona.local", "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    access_token = login_resp.json()["access_token"]
    
    # Set the access token in the refresh token cookie
    async_client.cookies.set("refresh_token", access_token)
    refresh_resp = await async_client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 401

@pytest.mark.asyncio
async def test_e2_refresh_token_used_as_access(async_client: AsyncClient, auth_test_user):
    # Additional test for token separation
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "test_auth@chrona.local", "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    refresh_token = login_resp.cookies.get("refresh_token") or login_resp.json().get("refresh_token")
    
    # Use refresh token as access token
    headers = {"Authorization": f"Bearer {refresh_token}"}
    resp = await async_client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_f_logout(async_client: AsyncClient, auth_test_user, db_session):
    # Test F - Logout
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "test_auth@chrona.local", "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    refresh_token = login_resp.cookies.get("refresh_token") or login_resp.json().get("refresh_token")
    async_client.cookies.set("refresh_token", refresh_token)
    
    # Logout
    logout_resp = await async_client.post("/api/v1/auth/logout")
    assert logout_resp.status_code == 200
    
    # Check session is revoked in DB
    from app.models.identity import UserSession
    res = await db_session.execute(select(UserSession).filter(UserSession.refresh_token == refresh_token))
    session = res.scalars().first()
    assert session.is_revoked == True

@pytest.mark.asyncio
async def test_g_refresh_after_logout(async_client: AsyncClient, auth_test_user):
    # Test G - Refresh after logout
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "test_auth@chrona.local", "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    refresh_token = login_resp.cookies.get("refresh_token") or login_resp.json().get("refresh_token")
    async_client.cookies.set("refresh_token", refresh_token)
    
    # Logout
    await async_client.post("/api/v1/auth/logout")
    
    # Attempt to refresh with the same revoked token
    refresh_resp = await async_client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 401

@pytest.mark.asyncio
async def test_h_existing_rbac(async_client: AsyncClient, auth_test_user):
    # Test H - Existing RBAC still works
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "test_auth@chrona.local", "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    access_token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = await async_client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test_auth@chrona.local"
