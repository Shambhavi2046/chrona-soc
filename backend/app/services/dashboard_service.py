from sqlalchemy.orm import Session

from app.models.alert_model import Alert


def get_dashboard_stats(db: Session):

    total_alerts = db.query(Alert).count()

    open_alerts = db.query(Alert).filter(
        Alert.status == "open"
    ).count()

    resolved_alerts = db.query(Alert).filter(
        Alert.status == "resolved"
    ).count()

    high_risk_alerts = db.query(Alert).filter(
        Alert.risk_score >= 70
    ).count()

    top_threat = (
        db.query(Alert.threat_type)
        .group_by(Alert.threat_type)
        .first()
    )

    return {
        "total_alerts": total_alerts,
        "open_alerts": open_alerts,
        "resolved_alerts": resolved_alerts,
        "high_risk_alerts": high_risk_alerts,
        "top_threat": top_threat[0] if top_threat else None
    }