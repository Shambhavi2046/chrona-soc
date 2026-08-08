import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.credentials import IntegrationCredential
from app.db.base_class import Base
from app.main import app

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def async_client(db_session):
    from app.db.session import get_db
    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_credentials_crud(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Create a credential
    create_data = {
        "name": "Test Key",
        "provider": "threatfox",
        "secret": "supersecretkey123"
    }
    resp = await async_client.post("/api/v1/soar/credentials", json=create_data)
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Test Key"
    assert data["provider"] == "threatfox"
    assert "secret" not in data  # No secret leakage in response
    cred_id = data["id"]

    import uuid
    cred_uuid = uuid.UUID(cred_id)
    # Verify it is encrypted in DB
    result = await db_session.execute(select(IntegrationCredential).where(IntegrationCredential.id == cred_uuid))
    cred_in_db = result.scalars().first()
    assert cred_in_db is not None
    assert cred_in_db.encrypted_secret != "supersecretkey123"

    # 2. List credentials
    list_resp = await async_client.get("/api/v1/soar/credentials")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert any(c["id"] == cred_id for c in list_data)
    assert all("secret" not in c for c in list_data)

    # 3. Delete credential
    del_resp = await async_client.delete(f"/api/v1/soar/credentials/{cred_id}")
    assert del_resp.status_code == 200

    # Verify deleted
    list_resp2 = await async_client.get("/api/v1/soar/credentials")
    list_data2 = list_resp2.json()
    assert not any(c["id"] == cred_id for c in list_data2)
