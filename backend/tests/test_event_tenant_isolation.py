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

@pytest.mark.asyncio
async def test_detection_engine_tenant_isolation(async_client: AsyncClient, monkeypatch, db_session):
    """TEST H: Detection engine persistence and tenant isolation"""
    from app.models.operations import Alert
    from sqlalchemy import select

    # Mock async_session_maker to use our test db_session so background task writes to our test DB
    from contextlib import asynccontextmanager
    @asynccontextmanager
    async def mock_async_session_maker():
        yield db_session
    monkeypatch.setattr("app.api.v1.events.async_session_maker", mock_async_session_maker)

    # 1. Org A Event triggering brute force rule
    switch_user(user_a)
    resp_a = await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-DET-A-1",
        "timestamp": "2023-10-01T12:00:00Z",
        "source": "aws",
        "event_type": "logon",
        "severity": "low",
        "status": "failure",
        "normalized_data": {"threat": "brute_force"},
        "raw_event": {}
    })
    assert resp_a.status_code == 201

    await asyncio.sleep(0.2) # Allow background detection task to run

    # 2. Org B Event triggering brute force rule
    switch_user(user_b)
    resp_b = await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-DET-B-1",
        "timestamp": "2023-10-01T12:00:00Z",
        "source": "aws",
        "event_type": "logon",
        "severity": "low",
        "status": "failure",
        "normalized_data": {"threat": "brute_force"},
        "raw_event": {}
    })
    assert resp_b.status_code == 201

    await asyncio.sleep(0.2) # Allow background detection task to run

    # 3. Verify DB persistence and tenant assignment
    alerts_result = await db_session.execute(select(Alert).filter(Alert.org_id == org_a_id))
    alerts_a = alerts_result.scalars().all()
    alert_a = next((a for a in alerts_a if a.raw_log.get("event_id") == "EVT-DET-A-1"), None)
    assert alert_a is not None, "Detection failed to create Alert for Org A (IntegrityError?)"
    assert alert_a.org_id == org_a_id, "Alert A org_id does not match Event A tenant_id"

    alerts_result_b = await db_session.execute(select(Alert).filter(Alert.org_id == org_b_id))
    alerts_b = alerts_result_b.scalars().all()
    alert_b = next((a for a in alerts_b if a.raw_log.get("event_id") == "EVT-DET-B-1"), None)
    assert alert_b is not None, "Detection failed to create Alert for Org B"
    assert alert_b.org_id == org_b_id, "Alert B org_id does not match Event B tenant_id"

    # 4. Verify API Tenant Isolation (Org B cannot fetch Org A's alerts)
    switch_user(user_b)
    resp = await async_client.get("/api/v1/alerts")
    if resp.status_code == 200:
        alert_ids = [a["id"] for a in resp.json()]
        assert str(alert_a.id) not in alert_ids, "Org B can see Org A's alert!"
        assert str(alert_b.id) in alert_ids, "Org B cannot see its own alert!"

@pytest.mark.asyncio
async def test_correlation_tenant_isolation(async_client: AsyncClient, monkeypatch, db_session):
    """TEST I: Detection engine correlation tenant isolation"""
    from app.models.operations import Alert
    from sqlalchemy import select

    # Mock async_session_maker
    from contextlib import asynccontextmanager
    @asynccontextmanager
    async def mock_async_session_maker():
        yield db_session
    monkeypatch.setattr("app.api.v1.events.async_session_maker", mock_async_session_maker)

    # 1. Org A Event -> Creates Alert
    switch_user(user_a)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-CORR-A-1",
        "timestamp": "2023-10-01T12:00:00Z",
        "source": "aws",
        "event_type": "logon",
        "severity": "low",
        "status": "failure",
        "user_account": "shared_admin",
        "normalized_data": {"threat": "brute_force"},
        "raw_event": {}
    })

    await asyncio.sleep(0.2)

    # 2. Org B Event -> Should create NEW alert, NOT correlate with Org A
    switch_user(user_b)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-CORR-B-1",
        "timestamp": "2023-10-01T12:05:00Z",
        "source": "aws",
        "event_type": "logon",
        "severity": "low",
        "status": "failure",
        "user_account": "shared_admin",
        "normalized_data": {"threat": "brute_force"},
        "raw_event": {}
    })

    await asyncio.sleep(0.2)

    # 3. Org A Event 2 -> Should correlate with Org A's alert
    switch_user(user_a)
    await async_client.post("/api/v1/events/ingest", json={
        "event_id": "EVT-CORR-A-2",
        "timestamp": "2023-10-01T12:10:00Z",
        "source": "aws",
        "event_type": "logon",
        "severity": "low",
        "status": "failure",
        "user_account": "shared_admin",
        "normalized_data": {"threat": "brute_force"},
        "raw_event": {}
    })

    await asyncio.sleep(0.2)

    # Verify
    alerts_result_a = await db_session.execute(select(Alert).filter(Alert.org_id == org_a_id))
    alerts_a = [a for a in alerts_result_a.scalars().all() if "EVT-CORR" in a.raw_log.get("event_id", "")]
    assert len(alerts_a) == 1
    assert len(alerts_a[0].related_events) == 2

    alerts_result_b = await db_session.execute(select(Alert).filter(Alert.org_id == org_b_id))
    alerts_b = [a for a in alerts_result_b.scalars().all() if "EVT-CORR" in a.raw_log.get("event_id", "")]
    assert len(alerts_b) == 1
    assert len(alerts_b[0].related_events) == 1
