import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.base_class import Base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import get_db
import uuid
from app.models.identity import Organization, Role, User, UserRole
from app.core.security import get_password_hash
from jose import jwt
from app.core.config import settings
import hashlib
from datetime import datetime, timedelta

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
    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def auth_test_user(db_session):
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
    await db_session.delete(user)
    await db_session.commit()

@pytest.mark.asyncio
async def test_normal_login_and_token_version(async_client: AsyncClient, auth_test_user, db_session):
    login_data = {"username": auth_test_user.email, "password": "TestPass123!"}
    response = await async_client.post("/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert "session_version" in payload
    assert payload["session_version"] == 1
    
    response = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_password_change_revocation(async_client: AsyncClient, auth_test_user, db_session):
    login_data = {"username": auth_test_user.email, "password": "TestPass123!"}
    resp = await async_client.post("/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token_a = resp.json()["access_token"]
    
    resp = await async_client.patch(
        "/api/v1/users/me/password",
        json={"current_password": "TestPass123!", "new_password": "NewPassword123!"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert resp.status_code == 200
    
    resp = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_a}"})
    assert resp.status_code == 401
    
    import asyncio
    await asyncio.sleep(1)
    login_data["password"] = "NewPassword123!"
    resp = await async_client.post("/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    assert resp.status_code == 200

@pytest.mark.asyncio
async def test_forgot_password_reset_revocation(async_client: AsyncClient, auth_test_user, db_session):
    login_data = {"username": auth_test_user.email, "password": "TestPass123!"}
    resp = await async_client.post("/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token_a = resp.json()["access_token"]
    
    import secrets
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    from app.models.identity import PasswordResetToken
    reset_token = PasswordResetToken(
        user_id=auth_test_user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db_session.add(reset_token)
    await db_session.commit()
    
    resp = await async_client.post("/api/v1/auth/reset-password", json={
        "token": raw_token,
        "new_password": "NewPassword123!"
    })
    assert resp.status_code == 200
    
    resp = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_a}"})
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_admin_password_reset_revocation(async_client: AsyncClient, auth_test_user, db_session):
    login_data = {"username": auth_test_user.email, "password": "TestPass123!"}
    resp = await async_client.post("/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token_a = resp.json()["access_token"]
    
    # We use token_a as the admin token since the user is Super Admin
    resp = await async_client.patch(
        f"/api/v1/users/{auth_test_user.id}",
        json={"password": "AdminNewPassword123!"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert resp.status_code == 200
    
    # token_a is revoked because auth_test_user's session_version incremented
    resp = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_a}"})
    assert resp.status_code == 401
    
    import asyncio
    await asyncio.sleep(1)
    login_data["password"] = "AdminNewPassword123!"
    resp = await async_client.post("/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    assert resp.status_code == 200

@pytest.mark.asyncio
async def test_normal_operation_and_invalid_tokens(async_client: AsyncClient, auth_test_user, db_session):
    login_data = {"username": auth_test_user.email, "password": "TestPass123!"}
    resp = await async_client.post("/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = resp.json()["access_token"]
    
    resp = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    
    resp = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}123"})
    assert resp.status_code == 401
    
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    payload["exp"] = (datetime.utcnow() - timedelta(minutes=1)).timestamp()
    expired_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    resp = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401
