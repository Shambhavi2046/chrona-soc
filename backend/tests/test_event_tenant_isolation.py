import pytest
import pytest_asyncio
import httpx
from httpx import AsyncClient, ASGITransport
import uuid
import asyncio
from typing import List

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

super_admin_role = Role(name="Super Admin", permissions=["events:read", "events:write"])

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
async def test_duplicate_event_id_cross_tenant(async_client: AsyncClient, db_session):
    """TEST A: Duplicate event ID cross-tenant protection."""
    switch_user(user_a)
    payload_a = {
        "event_id": "EVT-DUP-001",
        "timestamp": "2023-10-01T12:00:00Z",
        "source": "aws",
        "event_type": "login",
        "severity": "low",
        "raw_event": {"tenant": "A"}
    }
    resp1 = await async_client.post("/api/v1/events/ingest", json=payload_a)
    assert resp1.status_code == 201

    switch_user(user_b)
    payload_b = {
        "event_id": "EVT-DUP-001",
        "timestamp": "2023-10-01T12:05:00Z",
        "source": "aws",
        "event_type": "logout",
        "severity": "high",
        "raw_event": {"tenant": "B"}
    }
    resp2 = await async_client.post("/api/v1/events/ingest", json=payload_b)
    assert resp2.status_code == 409
    assert "Event conflict" in resp2.json()["detail"]

@pytest.mark.asyncio
async def test_event_list_isolation(async_client: AsyncClient):
    """TEST B: Event list isolation"""
    # Create event for A
    switch_user(user_a)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-LIST-A1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}
    })

    # Create event for B
    switch_user(user_b)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-LIST-B1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}
    })

    switch_user(user_a)
    resp = await async_client.get("/api/v1/events")
    assert resp.status_code == 200
    events = resp.json()
    event_ids = [e["event_id"] for e in events]
    assert "EVT-LIST-A1" in event_ids
    assert "EVT-LIST-B1" not in event_ids

@pytest.mark.asyncio
async def test_event_stats_isolation(async_client: AsyncClient):
    """TEST C: Event stats isolation"""
    switch_user(user_a)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-STAT-A1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "critical", "raw_event": {}
    })

    switch_user(user_b)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-STAT-B1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "info", "raw_event": {}
    })

    switch_user(user_a)
    resp = await async_client.get("/api/v1/events/stats")
    assert resp.status_code == 200
    stats = resp.json()
    assert stats["by_severity"].get("critical", 0) > 0
    assert stats["by_severity"].get("info", 0) == 0

@pytest.mark.asyncio
async def test_event_search_isolation(async_client: AsyncClient):
    """TEST D: Event search isolation"""
    switch_user(user_a)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-SEARCH-A1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "user_account": "attacker_a", "raw_event": {}
    })

    switch_user(user_b)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-SEARCH-B1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "user_account": "attacker_b", "raw_event": {}
    })

    switch_user(user_a)
    # Search for indicator in B
    resp = await async_client.get("/api/v1/events/search?user_account=attacker_b")
    assert resp.status_code == 200
    assert len(resp.json()) == 0

@pytest.mark.asyncio
async def test_event_detail_isolation(async_client: AsyncClient):
    """TEST E: Event detail isolation"""
    switch_user(user_a)
    resp_a = await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-DET-A1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}
    })
    event_uuid = resp_a.json()["id"]

    switch_user(user_b)
    resp_b = await async_client.get(f"/api/v1/events/{event_uuid}")
    assert resp_b.status_code == 404

@pytest.mark.asyncio
async def test_unauthenticated_access(db_session):
    """TEST F: Unauthenticated access"""
    # Create client WITHOUT get_current_user override
    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        assert (await c.get("/api/v1/events")).status_code in [401, 403]
        assert (await c.get("/api/v1/events/stats")).status_code in [401, 403]
        assert (await c.get("/api/v1/events/search")).status_code in [401, 403]
        assert (await c.get(f"/api/v1/events/{uuid.uuid4()}")).status_code in [401, 403]
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_bulk_detection_tenant_isolation(async_client: AsyncClient, monkeypatch, db_session):
    """TEST G: Bulk detection tenant isolation"""
    switch_user(user_a)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-BULK-A1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}
    })

    # Mock DetectionEngine
    processed_events = []
    async def mock_evaluate_event(self, db, event):
        processed_events.append(event.event_id)

    from app.services.detection.engine import DetectionEngine
    monkeypatch.setattr(DetectionEngine, "evaluate_event", mock_evaluate_event)

    # Mock async_session_maker
    from contextlib import asynccontextmanager
    @asynccontextmanager
    async def mock_async_session_maker():
        yield db_session
    monkeypatch.setattr("app.api.v1.events.async_session_maker", mock_async_session_maker)

    switch_user(user_b)
    # Org B attempts to bulk ingest Org A's event and one of its own
    payload = [
        {"event_id": "EVT-BULK-A1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}},
        {"event_id": "EVT-BULK-B1", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}}
    ]
    resp = await async_client.post("/api/v1/events/bulk", json=payload)
    assert resp.status_code == 201

    await asyncio.sleep(0.1)

    # Org B's valid event should be processed, but Org A's should be ignored
    assert "EVT-BULK-B1" in processed_events
    assert "EVT-BULK-A1" not in processed_events
