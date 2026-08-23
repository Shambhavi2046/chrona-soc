from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List, Optional
import uuid
from app.db.session import get_db
from app.repositories.threat_intel import ioc_repo
from app.schemas.threat_intel import IOCResponse, ThreatStatsResponse, ThreatFeedCreate, ThreatFeedResponse
from app.middleware.auth import require_permissions, get_current_user
from app.models.identity import User
from app.models.operations import IOC, ThreatFeed
from app.repositories.threat_intel import ioc_repo, threat_feed_repo
from app.services.threat_intel_sync import threat_feed_sync_service
from app.utils.validation import get_pagination, PaginationParams
from app.core.roles import Permission

router = APIRouter()

@router.get("/iocs", response_model=List[IOCResponse])
async def list_iocs(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_permissions([Permission.THREAT_INTEL_READ]))
):
    iocs = await ioc_repo.get_all(
        db, 
        skip=pagination.skip, 
        limit=pagination.limit, 
        org_id=current_user.org_id,
        search=search
    )
    return iocs

@router.get("/stats", response_model=ThreatStatsResponse)
async def get_threat_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions([Permission.THREAT_INTEL_READ]))
):
    # Stats scoped to tenant + global
    query = select(IOC)
    if current_user.org_id:
        query = query.filter(or_(IOC.org_id == current_user.org_id, IOC.org_id.is_(None)))
        
    result = await db.execute(query)
    iocs = result.scalars().all()
    
    active_threats = sum(1 for ioc in iocs if ioc.status == "Active")
    critical_indicators = sum(1 for ioc in iocs if ioc.confidence >= 80)
    blocked_iocs = sum(1 for ioc in iocs if ioc.status == "Blocked")
    
    # Calculate an average threat score (mocking an overall score based on avg confidence of active threats)
    active_confs = [ioc.confidence for ioc in iocs if ioc.status == "Active"]
    threat_score = int(sum(active_confs) / len(active_confs)) if active_confs else 0
    
    return ThreatStatsResponse(
        activeThreats=active_threats,
        criticalIndicators=critical_indicators,
        blockedIocs=blocked_iocs,
        threatScore=threat_score
    )

@router.post("/feeds", response_model=ThreatFeedResponse)
async def create_threat_feed(
    feed_in: ThreatFeedCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions([Permission.THREAT_INTEL_WRITE]))
):
    new_feed = ThreatFeed(
        id=uuid.uuid4(),
        org_id=current_user.org_id,
        name=feed_in.name,
        url=feed_in.url,
        status="Active"
    )
    db.add(new_feed)
    await db.commit()
    await db.refresh(new_feed)
    return new_feed

@router.get("/feeds", response_model=List[ThreatFeedResponse])
async def list_threat_feeds(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    current_user: User = Depends(require_permissions([Permission.THREAT_INTEL_READ]))
):
    feeds = await threat_feed_repo.get_all(
        db,
        skip=pagination.skip,
        limit=pagination.limit,
        org_id=current_user.org_id
    )
    return feeds

@router.post("/feeds/{feed_id}/sync")
async def sync_threat_feed(
    feed_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions([Permission.THREAT_INTEL_WRITE]))
):
    return await threat_feed_sync_service.sync_feed(db, feed_id, current_user.org_id)
