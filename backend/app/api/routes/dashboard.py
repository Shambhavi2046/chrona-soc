from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.services.dashboard_service import get_dashboard_stats


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db)
):

    stats = get_dashboard_stats(db)

    return stats