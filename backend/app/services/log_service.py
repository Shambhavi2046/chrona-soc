from sqlalchemy.orm import Session

from app.schemas.log_schema import LogCreate
from app.models.log_model import Log
from app.utils.logger import logger

from app.services.threat_detector import analyze_threat
from app.services.alert_service import create_alert


def process_log(db: Session, log: LogCreate):

    logger.info(
        f"Processing log | Source: {log.source} | Severity: {log.severity}"
    )

    # Save log
    db_log = Log(
        source=log.source,
        event=log.event,
        severity=log.severity,
        timestamp=log.timestamp
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)


    # Analyze threat
    threat_analysis = analyze_threat(
        log.event,
        log.severity
    )


    # Create alert if threat detected
    alert = None

    if threat_analysis["threat_detected"]:
        alert = create_alert(
            db=db,
            log_id=db_log.id,
            threat_type=threat_analysis["threat_type"],
            risk_score=threat_analysis["risk_score"]
        )


    return {
        "message": "Log stored successfully",
        "id": db_log.id,
        "source": db_log.source,
        "severity": db_log.severity,
        "threat_analysis": threat_analysis,
        "alert_created": alert is not None
    }