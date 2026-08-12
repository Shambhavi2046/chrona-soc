import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
from app.main import app
from app.models.identity import User, Role, Organization, AuditLog
from app.middleware.auth import get_current_user, require_permissions
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
    "users:read", "users:write", "roles:read", "roles:write"
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
async def test_admin_tenant_isolation(async_client: AsyncClient, db_session: AsyncSession):
    global current_mock_user
    
    # === USER LISTING ===
    current_mock_user = user_a
    res = await async_client.get("/api/v1/users")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["email"] == "user_a@org_a.local"

    # === USER GET BY ID ===
    res = await async_client.get(f"/api/v1/users/{user_b_id}")
    assert res.status_code == 404
    
    # === USER CREATION WITH FAKE ORG ID ===
    res = await async_client.post("/api/v1/users", json={
        "email": "hacked@orgb.com",
        "name": "Hacked",
        "password": "StrongPassword123!",
        "role_ids": [],
        "org_id": str(org_b_id) # Should be ignored
    })
    assert res.status_code == 200
    new_user = res.json()
    assert new_user["org_id"] == str(org_a_id)

    # === USER MODIFICATION ===
    res = await async_client.patch(f"/api/v1/users/{user_b_id}", json={"name": "Hacked"})
    assert res.status_code == 404
    
    # === ROLE ISOLATION ===
    res = await async_client.post("/api/v1/roles", json={
        "name": "Custom Role A",
        "description": "Specific to A",
        "permissions": []
    })
    assert res.status_code == 200

    current_mock_user = user_b
    res = await async_client.get("/api/v1/roles")
    assert res.status_code == 200
    roles = res.json()
    assert not any(r["name"] == "Custom Role A" for r in roles)

    # === ORGANIZATION LEAKAGE ===
    res = await async_client.get("/api/v1/organizations")
    assert res.status_code == 200
    orgs = res.json()
    assert len(orgs) == 1
    assert orgs[0]["id"] == str(org_b_id)

    # === ROLE UPDATE TESTS ===
    current_mock_user = user_a
    # User A creates a role
    res = await async_client.post("/api/v1/roles", json={
        "name": "Custom Role B",
        "description": "To be updated",
        "permissions": []
    })
    assert res.status_code == 200
    role_id = res.json()["id"]

    # Same-tenant role update (User A updates Role B)
    res = await async_client.patch(f"/api/v1/roles/{role_id}", json={"permissions": ["users:read"]})
    assert res.status_code == 200
    assert "users:read" in res.json()["permissions"]

    # Cross-tenant role update (User B attempts to update User A's role)
    current_mock_user = user_b
    res = await async_client.patch(f"/api/v1/roles/{role_id}", json={"permissions": ["users:write"]})
    assert res.status_code == 404

    # Global/system role modification attempt
    res = await async_client.patch(f"/api/v1/roles/{super_admin_role.id}", json={"permissions": []})
    assert res.status_code == 403

    # Unauthorized role update
    user_b_unauth = User(
        id=uuid.uuid4(), email="unauth@org_b.local", name="User B Unauth", status="Active", org_id=org_b_id, roles=[], hashed_password="mock"
    )
    db_session.add(user_b_unauth)
    await db_session.commit()
    
    current_mock_user = user_b_unauth
    res = await async_client.patch(f"/api/v1/roles/{role_id}", json={"permissions": []})
    assert res.status_code == 403

    # === USER SOFT DELETE TESTS ===
    current_mock_user = user_a
    # Create a user to delete
    res = await async_client.post("/api/v1/users", json={
        "email": "delete_me@org_a.local",
        "name": "Delete Me",
        "password": "StrongPassword123!",
        "role_ids": []
    })
    assert res.status_code == 200
    user_to_delete_id = res.json()["id"]
    
    # User B (cross-tenant) attempts to delete User A's user
    current_mock_user = user_b
    res = await async_client.delete(f"/api/v1/users/{user_to_delete_id}")
    assert res.status_code == 404
    
    # User A successfully soft deletes the user
    current_mock_user = user_a
    res = await async_client.delete(f"/api/v1/users/{user_to_delete_id}")
    assert res.status_code == 204
    
    # Deleted user is excluded from GET /users list
    res = await async_client.get("/api/v1/users")
    assert res.status_code == 200
    users = res.json()
    assert not any(u["id"] == user_to_delete_id for u in users)
    
    # Deleted user returns 404 on GET /users/{id}
    res = await async_client.get(f"/api/v1/users/{user_to_delete_id}")
    assert res.status_code == 404
    
    # Deleted user returns 404 on PATCH /users/{id}
    res = await async_client.patch(f"/api/v1/users/{user_to_delete_id}", json={"name": "Ghost"})
    assert res.status_code == 404
    
    # User B (cross-tenant) cannot retrieve the deleted user
    current_mock_user = user_b
    res = await async_client.get(f"/api/v1/users/{user_to_delete_id}")
    assert res.status_code == 404
