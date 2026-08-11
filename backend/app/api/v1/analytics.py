from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.analytics_schema import AnalyticsResponse
from app.services.analytics_service import get_analytics
from app.middleware.auth import require_permissions
from app.models.identity import User

router = APIRouter()

@router.get("", response_model=AnalyticsResponse)
async def get_analytics_dashboard(
    period: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["dashboard:read"]))
):
    """
    Returns aggregated SOC analytics data derived from existing alerts and logs.
    """
    return await get_analytics(db, org_id=current_user.org_id, period=period)
