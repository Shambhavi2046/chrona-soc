from sqlalchemy.orm import Session

from app.models.alert_model import Alert


def create_alert(
    db: Session,
    log_id: int,
    threat_type: str,
    risk_score: int
):

    alert = Alert(
        log_id=log_id,
        threat_type=threat_type,
        risk_score=risk_score,
        status="open"
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert