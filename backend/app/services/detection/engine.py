import logging
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event_model import SecurityEvent
from app.models.operations import Alert
from app.services.detection.rules import rule_registry
from app.services.detection.correlation import correlation_service
from app.services.detection.risk import risk_scoring_service
from app.services.detection.mitre import mitre_mapping_service
from app.services.detection.ioc import ioc_matcher

logger = logging.getLogger(__name__)

class DetectionEngine:
    async def evaluate_event(self, db: AsyncSession, event: SecurityEvent):
        """Evaluate a single normalized event against all active detection rules and IOCs."""
        try:
            # 1. IOC Matching
            ioc_matches = await ioc_matcher.check_event(db, event, event.tenant_id)
            if ioc_matches:
                # If IOC matches, we could generate an IOC alert immediately.
                # For this implementation, we'll just log it. A dedicated IOC rule could be created.
                logger.warning(f"IOC Match found for event {event.event_id}: {ioc_matches}")

            # 2. Rule Evaluation
            active_rules = rule_registry.get_all_rules()
            for rule in active_rules:
                is_match = await rule.evaluate(event)
                
                if is_match:
                    meta = rule.metadata
                    rule_id = meta["rule_id"]
                    logger.info(f"Event {event.event_id} triggered rule: {rule_id}")
                    
                    # 3. Correlation (Duplicate Suppression)
                    existing_alert = await correlation_service.find_correlated_alert(db, rule_id, event)
                    if existing_alert:
                        logger.info(f"Correlating event {event.event_id} to existing alert {existing_alert.id}")
                        await correlation_service.correlate_event_to_alert(db, existing_alert, event)
                        continue
                        
                    # 4. Generate New Alert
                    risk_score = risk_scoring_service.calculate_risk_score(
                        severity=meta["severity"], 
                        confidence=meta["confidence"]
                    )
                    mitre_mapping = mitre_mapping_service.get_mapping(rule_id)
                    
                    new_alert = Alert(
                        id=uuid.uuid4(),
                        org_id=event.tenant_id,
                        title=f"{meta['name']} Detected",
                        description=meta["description"],
                        threat_type=meta.get("threat_type", "Suspicious Activity"),
                        risk_score=risk_score,
                        severity=meta["severity"],
                        confidence=meta["confidence"],
                        status="Open",
                        source=event.source,
                        source_rule=rule_id,
                        mitre_tactic=mitre_mapping[0]["tactic"] if mitre_mapping else None,
                        mitre_technique=mitre_mapping[0]["technique"] if mitre_mapping else None,
                        mitre_mapping=mitre_mapping,
                        raw_log={
                            "event_id": event.event_id,
                            "user_account": event.user_account,
                            "hostname": event.hostname,
                            "ip_address": event.ip_address,
                            "ioc_matches": ioc_matches
                        },
                        related_events=[str(event.id)]
                    )
                    db.add(new_alert)
                    await db.commit()
                    logger.info(f"Generated new alert {new_alert.id} for rule {rule_id}")

        except Exception as e:
            logger.error(f"Error in detection engine for event {event.id}: {str(e)}", exc_info=True)

detection_engine = DetectionEngine()
