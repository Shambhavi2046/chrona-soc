from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List, Optional
import uuid
from app.db.session import get_db
from app.repositories.threat_intel import ioc_repo
from app.schemas.threat_intel import IOCResponse, ThreatStatsResponse
from app.middleware.auth import require_permissions, get_current_user
from app.models.identity import User
from app.models.operations import IOC
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
