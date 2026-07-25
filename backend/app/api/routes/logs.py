from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.log_schema import LogCreate, LogResponse
from app.services.log_service import process_log
from app.core.database import SessionLocal
from app.models.log_model import Log


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/logs")
def create_log(
    log: LogCreate,
    db: Session = Depends(get_db)
):
    return process_log(db, log)


@router.get("/logs", response_model=list[LogResponse])
def get_logs(
    db: Session = Depends(get_db)
):
    logs = db.query(Log).all()

    return logs