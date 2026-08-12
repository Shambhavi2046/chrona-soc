import pytest
import pytest_asyncio
import httpx
from httpx import AsyncClient, ASGITransport
import uuid
import asyncio

from app.main import app
from app.models.identity import User, Role, Organization
from app.middleware.auth import get_current_user
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.db.base_class import Base
from app.services.detection.engine import DetectionEngine

# Setup mock user and org
org_a_id = uuid.uuid4()
user_a_id = uuid.uuid4()

super_admin_role = Role(name="Super Admin", permissions=["events:read", "events:write"])
user_a = User(
    id=user_a_id, email="ingest@org_a.local", name="Ingest User", status="Active", org_id=org_a_id, roles=[super_admin_role]
)

async def mock_get_current_user():
    return user_a

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        session.add(Organization(id=org_a_id, name="Org A", status="Active"))
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
async def test_bulk_ingestion_resiliency(async_client: AsyncClient, monkeypatch, db_session):
    """
    Test that if one event fails in the background detection engine,
    the rest of the events in the batch are still processed.
    """
    processed_events = []

    # Mock async_session_maker to use our test session
    from contextlib import asynccontextmanager
    @asynccontextmanager
    async def mock_async_session_maker():
        yield db_session
    monkeypatch.setattr("app.api.v1.events.async_session_maker", mock_async_session_maker)

    # Mock the detection engine to fail on the second event
    async def mock_evaluate_event(self, db, event):
        if event.event_id == "EVT-002":
            raise Exception("Simulated engine crash for EVT-002")
        processed_events.append(event.event_id)

    monkeypatch.setattr(DetectionEngine, "evaluate_event", mock_evaluate_event)

    payload = [
        {"event_id": "EVT-001", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}},
        {"event_id": "EVT-002", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}},
        {"event_id": "EVT-003", "timestamp": "2023-10-01T12:00:00Z", "source": "aws", "event_type": "login", "severity": "low", "raw_event": {}}
    ]

    response = await async_client.post("/api/v1/events/bulk", json=payload)
    assert response.status_code == 201

    # Give the background task a moment to execute
    await asyncio.sleep(0.1)

    # Ensure EVT-001 and EVT-003 were processed, skipping the crashed EVT-002
    assert "EVT-001" in processed_events
    assert "EVT-003" in processed_events
    assert "EVT-002" not in processed_events
    assert len(processed_events) == 2
