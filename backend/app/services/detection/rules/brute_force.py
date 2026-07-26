from app.services.detection.rules.base import DetectionRule
from app.models.event_model import SecurityEvent

class BruteForceRule(DetectionRule):
    @property
    def metadata(self):
        return {
            "rule_id": "rule_brute_force_001",
            "name": "Brute Force Authentication",
            "version": "1.0",
            "severity": "high",
            "confidence": 80,
            "description": "Detects simulated brute force attacks by identifying failed logon events.",
            "enabled": True
        }

    async def evaluate(self, event: SecurityEvent) -> bool:
        if event.event_type == "logon" and event.status == "failure":
            if event.normalized_data and event.normalized_data.get("threat") == "brute_force":
                return True
        return False
