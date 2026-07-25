from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.alert_model import Alert
from app.schemas.alert_schema import AlertResponse
from app.schemas.alert_update_schema import AlertUpdate
from app.services.investigation_service import investigate_threat


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Get all alerts
@router.get("/alerts", response_model=list[AlertResponse])
def get_alerts(
    db: Session = Depends(get_db)
):
    alerts = db.query(Alert).all()

    return alerts


# Update alert status
@router.patch("/alerts/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    update: AlertUpdate,
    db: Session = Depends(get_db)
):

    alert = db.query(Alert).filter(
        Alert.id == alert_id
    ).first()

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    alert.status = update.status

    db.commit()
    db.refresh(alert)

    return alert


# AI Investigation endpoint
@router.get("/alerts/{alert_id}/investigate")
def investigate_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):

    alert = db.query(Alert).filter(
        Alert.id == alert_id
    ).first()

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    investigation = investigate_threat(
        alert.threat_type,
        alert.risk_score
    )

    return {
        "alert_id": alert.id,
        "threat_type": alert.threat_type,
        "risk_score": alert.risk_score,
        "status": alert.status,
        "investigation": investigation
    }