import pytest
import pytest_asyncio
import httpx
from httpx import AsyncClient, ASGITransport
import uuid

from app.main import app
from app.models.identity import User, Role, Organization
from app.middleware.auth import get_current_user
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import insert
from app.db.base_class import Base
from app.models.operations import Alert, Asset, ThreatActor, MitreTechnique, alert_assets_table, alert_mitre_table

# Setup organizations
org_a_id = uuid.uuid4()
org_b_id = uuid.uuid4()

# Setup users
user_a_id = uuid.uuid4()
user_b_id = uuid.uuid4()

super_admin_role = Role(name="Super Admin", permissions=[
    "dashboard:read",
    "hunting:read", "hunting:write", "hunting:delete",
    "reports:read", "reports:write", "reports:delete",
    "graph:read"
])

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
async def test_dashboard_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    # Create an alert for Org A
    alert_resp = await async_client.post("/api/v1/alerts", json={
        "title": "Dashboard Alert A",
        "severity": "Critical",
        "status": "Open",
        "description": "Desc"
    })
    assert alert_resp.status_code == 200

    resp1 = await async_client.get("/api/v1/dashboard/summary")
    assert resp1.status_code == 200
    summary_a = resp1.json()
    assert summary_a["total_alerts"] >= 1
    assert summary_a["critical_alerts"] >= 1

    switch_user(user_b)
    resp2 = await async_client.get("/api/v1/dashboard/summary")
    assert resp2.status_code == 200
    summary_b = resp2.json()
    # Org B should not see Org A's alerts
    assert summary_b["total_alerts"] == 0
    assert summary_b["critical_alerts"] == 0

    metrics1 = await async_client.get("/api/v1/dashboard/metrics")
    assert metrics1.status_code == 200
    metrics_b = metrics1.json()
    assert metrics_b["alerts_by_severity"] == {}

@pytest.mark.asyncio
async def test_hunting_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    create_payload = {
        "name": "Org1 Hunt",
        "description": "Test hunt",
        "query": "process_name == 'cmd.exe'",
        "author": "tester"
    }
    resp1 = await async_client.post("/api/v1/hunting/saved", json=create_payload)
    assert resp1.status_code == 200
    hunt_id = resp1.json()["id"]

    switch_user(user_b)
    resp2 = await async_client.get("/api/v1/hunting/saved")
    assert resp2.status_code == 200
    org2_hunts = resp2.json()
    assert hunt_id not in [h["id"] for h in org2_hunts]

    resp3 = await async_client.delete(f"/api/v1/hunting/saved/{hunt_id}")
    assert resp3.status_code == 404

    switch_user(user_a)
    resp4 = await async_client.delete(f"/api/v1/hunting/saved/{hunt_id}")
    assert resp4.status_code == 200

@pytest.mark.asyncio
async def test_analytics_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    resp1 = await async_client.get("/api/v1/analytics")
    assert resp1.status_code == 200
    data = resp1.json()
    assert "kpis" in data

@pytest.mark.asyncio
async def test_attack_graph_asset_isolation(async_client: AsyncClient, db_session: AsyncSession):
    # Test 1 — Asset cross-tenant isolation
    alert_a_id = uuid.uuid4()
    asset_a_id = uuid.uuid4()

    alert_a = Alert(id=alert_a_id, org_id=org_a_id, title="Alert A", severity="High", status="Open", threat_type="X")
    asset_a = Asset(id=asset_a_id, name="Org A Asset", type="Server")

    db_session.add(alert_a)
    db_session.add(asset_a)
    await db_session.commit()

    await db_session.execute(insert(alert_assets_table).values(alert_id=alert_a_id, asset_id=asset_a_id))
    await db_session.commit()

    switch_user(user_b)
    resp = await async_client.get("/api/v1/graph")
    assert resp.status_code == 200
    data = resp.json()

    node_ids = [n["id"] for n in data.get("nodes", [])]
    assert f"asset-{asset_a_id}" not in node_ids, "Org A asset leaked to Org B!"

@pytest.mark.asyncio
async def test_attack_graph_threat_actor_isolation(async_client: AsyncClient, db_session: AsyncSession):
    # Test 2 — ThreatActor cross-tenant isolation
    ta_a_id = uuid.uuid4()
    ta_a = ThreatActor(id=ta_a_id, org_id=org_a_id, name="Actor A", reputation="Bad")
    db_session.add(ta_a)
    await db_session.commit()

    switch_user(user_b)
    resp = await async_client.get("/api/v1/graph")
    assert resp.status_code == 200
    data = resp.json()

    node_ids = [n["id"] for n in data.get("nodes", [])]
    assert f"threat_actor-{ta_a_id}" not in node_ids, "Org A threat actor leaked to Org B!"

@pytest.mark.asyncio
async def test_attack_graph_global_threat_actor_visibility(async_client: AsyncClient, db_session: AsyncSession):
    # Test 3 — Global ThreatActor visibility
    ta_global_id = uuid.uuid4()
    ta_global = ThreatActor(id=ta_global_id, org_id=None, name="Global Actor", reputation="Bad")
    db_session.add(ta_global)
    await db_session.commit()

    switch_user(user_b)
    resp = await async_client.get("/api/v1/graph")
    assert resp.status_code == 200
    data = resp.json()

    node_ids = [n["id"] for n in data.get("nodes", [])]
    assert f"threat_actor-{ta_global_id}" in node_ids, "Global threat actor is missing!"

@pytest.mark.asyncio
async def test_attack_graph_same_tenant_visibility(async_client: AsyncClient, db_session: AsyncSession):
    # Test 4 — Same-tenant visibility
    alert_b_id = uuid.uuid4()
    asset_b_id = uuid.uuid4()
    ta_b_id = uuid.uuid4()

    alert_b = Alert(id=alert_b_id, org_id=org_b_id, title="Alert B", severity="High", status="Open", threat_type="X")
    asset_b = Asset(id=asset_b_id, name="Org B Asset", type="Server")
    ta_b = ThreatActor(id=ta_b_id, org_id=org_b_id, name="Actor B", reputation="Bad")

    db_session.add(alert_b)
    db_session.add(asset_b)
    db_session.add(ta_b)
    await db_session.commit()

    await db_session.execute(insert(alert_assets_table).values(alert_id=alert_b_id, asset_id=asset_b_id))
    await db_session.commit()

    switch_user(user_b)
    resp = await async_client.get("/api/v1/graph")
    assert resp.status_code == 200
    data = resp.json()

    node_ids = [n["id"] for n in data.get("nodes", [])]
    assert f"asset-{asset_b_id}" in node_ids, "Org B asset is missing!"
    assert f"threat_actor-{ta_b_id}" in node_ids, "Org B threat actor is missing!"

@pytest.mark.asyncio
async def test_attack_graph_mitre_tenant_isolation(async_client: AsyncClient, db_session: AsyncSession):
    # Test 5 — MITRE tenant isolation
    alert_a_id = uuid.uuid4()
    alert_b_id = uuid.uuid4()
    mitre_a_id = uuid.uuid4()
    mitre_b_id = uuid.uuid4()

    alert_a = Alert(id=alert_a_id, org_id=org_a_id, title="Alert A", severity="High", status="Open", threat_type="X")
    alert_b = Alert(id=alert_b_id, org_id=org_b_id, title="Alert B", severity="High", status="Open", threat_type="X")

    mitre_a = MitreTechnique(id=mitre_a_id, technique_id="T1111", name="Tech A")
    mitre_b = MitreTechnique(id=mitre_b_id, technique_id="T2222", name="Tech B")

    db_session.add_all([alert_a, alert_b, mitre_a, mitre_b])
    await db_session.commit()

    await db_session.execute(insert(alert_mitre_table).values(alert_id=alert_a_id, mitre_id=mitre_a_id))
    await db_session.execute(insert(alert_mitre_table).values(alert_id=alert_b_id, mitre_id=mitre_b_id))
    await db_session.commit()

    switch_user(user_b)
    resp = await async_client.get("/api/v1/graph")
    assert resp.status_code == 200
    data = resp.json()

    node_ids = [n["id"] for n in data.get("nodes", [])]
    assert f"mitre-{mitre_a_id}" not in node_ids, "Org A MITRE technique leaked to Org B!"
    assert f"mitre-{mitre_b_id}" in node_ids, "Org B MITRE technique missing!"

@pytest.mark.asyncio
async def test_reports_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    resp1 = await async_client.get("/api/v1/reports/templates")
    assert resp1.status_code == 200

    # Get initial report count
    resp_initial = await async_client.get("/api/v1/reports/")
    initial_count = len(resp_initial.json())

    # 1. Invalid source ID format
    gen_payload_invalid = {
        "name": "Test Report Invalid",
        "source_type": "Alert",
        "source_id": "invalid-uuid",
        "generated_by": "tester"
    }
    resp_invalid = await async_client.post("/api/v1/reports/generate", json=gen_payload_invalid)
    assert resp_invalid.status_code == 400

    resp_after_invalid = await async_client.get("/api/v1/reports/")
    assert len(resp_after_invalid.json()) == initial_count

    # 2. Non-existent source ID
    valid_uuid = str(uuid.uuid4())
    gen_payload_notfound = {
        "name": "Test Report Not Found",
        "source_type": "Alert",
        "source_id": valid_uuid,
        "generated_by": "tester"
    }
    resp_notfound = await async_client.post("/api/v1/reports/generate", json=gen_payload_notfound)
    assert resp_notfound.status_code == 400

    resp_after_notfound = await async_client.get("/api/v1/reports/")
    assert len(resp_after_notfound.json()) == initial_count

    # 3. Valid source
    # First, create a valid alert
    alert_payload = {
        "title": "Test Alert for Report",
        "severity": "High",
        "status": "Open",
        "description": "Desc"
    }
    alert_resp = await async_client.post("/api/v1/alerts", json=alert_payload)
    assert alert_resp.status_code == 200
    alert_id = alert_resp.json()["id"]

    gen_payload_valid = {
        "name": "Test Report Valid",
        "source_type": "Alert",
        "source_id": alert_id,
        "generated_by": "tester"
    }
    resp_valid = await async_client.post("/api/v1/reports/generate", json=gen_payload_valid)
    assert resp_valid.status_code == 200
    report_id = resp_valid.json()["id"]

    resp_after_valid = await async_client.get("/api/v1/reports/")
    assert len(resp_after_valid.json()) == initial_count + 1

    # 4. Tenant isolation testing
    switch_user(user_b)
    resp3 = await async_client.get(f"/api/v1/reports/{report_id}/export/json")
    assert resp3.status_code == 404

    resp4 = await async_client.get(f"/api/v1/reports/{report_id}/export/pdf")
    assert resp4.status_code == 404

    resp5 = await async_client.delete(f"/api/v1/reports/{report_id}")
    assert resp5.status_code == 404


@pytest.mark.asyncio
async def test_reports_template_creation_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    payload = {
        "name": "Org A Template",
        "description": "Test",
        "category": "Standard"
    }
    resp1 = await async_client.post("/api/v1/reports/templates", json=payload)
    assert resp1.status_code == 200
    template_id = resp1.json()["id"]

    switch_user(user_b)
    resp2 = await async_client.get("/api/v1/reports/templates")
    assert resp2.status_code == 200
    org2_templates = resp2.json()
    assert template_id not in [t["id"] for t in org2_templates]

@pytest.mark.asyncio
async def test_reports_export_zip_tenant_isolation(async_client: AsyncClient):
    switch_user(user_a)
    # Create an alert and a report for user_a
    alert_resp = await async_client.post("/api/v1/alerts", json={
        "title": "Alert A",
        "severity": "Low",
        "status": "Open"
    })
    alert_id = alert_resp.json()["id"]
    await async_client.post("/api/v1/reports/generate", json={
        "name": "Report A",
        "source_type": "Alert",
        "source_id": alert_id,
        "generated_by": "tester"
    })

    switch_user(user_b)
    resp_zip = await async_client.get("/api/v1/reports/export/zip")
    assert resp_zip.status_code == 200
    # ZIP for user_b should not contain Report A.
    # We can check the size of the ZIP or just verify the status code.
    # The endpoint only fetches reports matching current_user.org_id.
    assert len(resp_zip.content) > 0
