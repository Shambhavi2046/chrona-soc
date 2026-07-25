from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.analytics_schema import AnalyticsResponse
from app.services import analytics_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics_dashboard(db: Session = Depends(get_db)):
    """
    Returns aggregated SOC analytics data derived from existing alerts and logs.
    """
    return analytics_service.get_analytics(db)
