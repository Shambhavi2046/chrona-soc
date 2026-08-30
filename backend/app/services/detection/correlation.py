from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.models.operations import Alert
from app.models.event_model import SecurityEvent

class CorrelationService:
    CORRELATION_WINDOW_MINUTES = 15

    @classmethod
    async def find_correlated_alert(cls, db: AsyncSession, rule_id: str, event: SecurityEvent) -> Optional[Alert]:
        """
        Find an existing open alert triggered by the same rule for the same entity 
        within the correlation window.
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=cls.CORRELATION_WINDOW_MINUTES)
        
        # Base query: Same rule, Open status, recently created
        query = select(Alert).where(
            and_(
                Alert.source_rule == rule_id,
                Alert.status == "Open",
                Alert.created_at >= cutoff_time,
                Alert.org_id == event.tenant_id
            )
        )
        
        # Correlate by hostname or user account if available
        # Note: We need a way to filter based on raw log or a correlation key. 
        # Since Alerts don't have dedicated 'hostname' columns, we would ideally extract this or store it.
        # For this Phase, we'll fetch recent alerts for the rule and check raw_log JSON or just group by rule_id and IP/User if we add it.
        # To avoid complex JSON filtering in SQLite, we will fetch the recent alerts for the rule and filter in Python.
        
        result = await db.execute(query.order_by(Alert.created_at.desc()))
        recent_alerts = result.scalars().all()
        
        for alert in recent_alerts:
            # Simple heuristic: If the alert has the same User Account or Hostname in its raw_log
            alert_user = alert.raw_log.get("user_account")
            alert_host = alert.raw_log.get("hostname")
            alert_ip = alert.raw_log.get("ip_address")
            
            if event.user_account and alert_user == event.user_account:
                return alert
            if event.hostname and alert_host == event.hostname:
                return alert
            if event.ip_address and alert_ip == event.ip_address:
                return alert
                
        return None

    @classmethod
    async def correlate_event_to_alert(cls, db: AsyncSession, alert: Alert, event: SecurityEvent):
        """Append the event ID to the alert's related_events list and update risk score/severity if needed."""
        if alert.related_events is None:
            alert.related_events = []
            
        if str(event.id) not in alert.related_events:
            # We must create a new list so SQLAlchemy detects the JSON mutation
            new_events = list(alert.related_events)
            new_events.append(str(event.id))
            alert.related_events = new_events
            
            # Optionally bump risk score due to frequency
            if alert.risk_score < 100:
                alert.risk_score = min(alert.risk_score + 5, 100)
                
            db.add(alert)
            await db.commit()
            await db.refresh(alert)
            
        return alert

correlation_service = CorrelationService()
