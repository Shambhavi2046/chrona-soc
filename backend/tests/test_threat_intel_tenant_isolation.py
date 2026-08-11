import pytest
import pytest_asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.models.identity import Organization
from app.models.operations import IOC, ThreatActor, Malware
from app.repositories.threat_intel import ioc_repo, threat_actor_repo, malware_repo
from app.db.base_class import Base

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def test_org_a(db_session: AsyncSession):
    org = Organization(name="Test Org A")
    db_session.add(org)
    await db_session.commit()
    await db_session.refresh(org)
    return org

@pytest_asyncio.fixture
async def test_org_b(db_session: AsyncSession):
    org = Organization(name="Test Org B")
    db_session.add(org)
    await db_session.commit()
    await db_session.refresh(org)
    return org

@pytest.mark.asyncio
async def test_tenant_owned_ioc_has_organization(db_session: AsyncSession, test_org_a: Organization):
    # 1. Tenant-owned IOC has an organization
    ioc = IOC(type="ip", value=f"10.0.0.{uuid.uuid4().hex[:4]}", org_id=test_org_a.id)
    db_session.add(ioc)
    await db_session.commit()
    await db_session.refresh(ioc)
    
    assert ioc.org_id == test_org_a.id
    
    # 2. Tenant-owned records can be scoped by organization
    retrieved = await ioc_repo.get(db_session, id=ioc.id, org_id=test_org_a.id)
    assert retrieved is not None
    assert retrieved.id == ioc.id

@pytest.mark.asyncio
async def test_cross_tenant_ioc_isolation(db_session: AsyncSession, test_org_a: Organization, test_org_b: Organization):
    # 3. Org A cannot retrieve Org B's tenant-owned record through repository access
    org_b_ioc = IOC(type="domain", value=f"evil-b-{uuid.uuid4().hex[:4]}.com", org_id=test_org_b.id)
    db_session.add(org_b_ioc)
    await db_session.commit()
    await db_session.refresh(org_b_ioc)
    
    # Org A tries to access Org B's IOC
    attempt = await ioc_repo.get(db_session, id=org_b_ioc.id, org_id=test_org_a.id)
    assert attempt is None  # Should be isolated

@pytest.mark.asyncio
async def test_global_vs_tenant_intelligence(db_session: AsyncSession, test_org_a: Organization):
    # 4. Global intelligence can be distinguished from tenant-owned intelligence
    global_ioc = IOC(type="hash", value=f"deadbeef{uuid.uuid4().hex[:4]}")
    # Note: org_id is omitted (NULL) by default
    db_session.add(global_ioc)
    await db_session.commit()
    await db_session.refresh(global_ioc)
    
    assert global_ioc.org_id is None
    
    # Org A CAN retrieve the global record
    retrieved_global = await ioc_repo.get(db_session, id=global_ioc.id, org_id=test_org_a.id)
    assert retrieved_global is not None
    assert retrieved_global.id == global_ioc.id

@pytest.mark.asyncio
async def test_global_records_cannot_accidentally_become_tenant(db_session: AsyncSession, test_org_a: Organization):
    # 5. Global records cannot accidentally become associated with a tenant
    # Using the repository 'get_all' method, global records should be included, 
    # but their org_id should remain NULL, proving they are still global.
    global_actor = ThreatActor(name=f"APT-GLOBAL-{uuid.uuid4().hex[:4]}")
    db_session.add(global_actor)
    await db_session.commit()
    
    all_actors = await threat_actor_repo.get_all(db_session, org_id=test_org_a.id)
    
    found_global = False
    for actor in all_actors:
        if actor.name == global_actor.name:
            found_global = True
            assert actor.org_id is None # Must remain global!
            
    assert found_global is True

@pytest.mark.asyncio
async def test_existing_attack_graph_relationships(db_session: AsyncSession, test_org_a: Organization):
    # 6. Existing Attack Graph relationships still work
    actor = ThreatActor(name=f"Actor-{uuid.uuid4().hex[:4]}", org_id=test_org_a.id)
    malware = Malware(name=f"Malware-{uuid.uuid4().hex[:4]}", org_id=test_org_a.id)
    
    # Use the existing relationship
    actor.malware.append(malware)
    db_session.add(actor)
    await db_session.commit()
    
    from sqlalchemy.orm import selectinload
    from sqlalchemy import select
    query = select(ThreatActor).options(selectinload(ThreatActor.malware)).filter(ThreatActor.id == actor.id)
    result = await db_session.execute(query)
    actor_reloaded = result.scalars().first()
    
    assert len(actor_reloaded.malware) == 1
    assert actor_reloaded.malware[0].id == malware.id
