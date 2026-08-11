from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.services.dashboard import dashboard_service
from app.services.operations import alert_service
from app.schemas.dashboard import DashboardSummary, DashboardMetrics
from app.schemas.operations import AlertResponse
from app.middleware.auth import require_permissions

from app.models.identity import User

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["dashboard:read"]))
):
    return await dashboard_service.get_summary(db, org_id=current_user.org_id)

@router.get("/metrics", response_model=DashboardMetrics)
async def get_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["dashboard:read"]))
):
    return await dashboard_service.get_metrics(db, org_id=current_user.org_id)

@router.get("/recent-alerts", response_model=List[AlertResponse])
async def get_recent_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["dashboard:read"]))
):
    return await alert_service.repository.get_recent(db, limit=10, org_id=current_user.org_id)
