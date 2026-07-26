from app.services.detection.rules.base import DetectionRule
from app.models.event_model import SecurityEvent

class MaliciousNetworkRule(DetectionRule):
    @property
    def metadata(self):
        return {
            "rule_id": "rule_network_001",
            "name": "Malicious Network Connection Blocked",
            "version": "1.0",
            "severity": "medium",
            "confidence": 75,
            "description": "Detects firewall blocks indicative of communicating with a known malicious IP.",
            "enabled": True
        }

    async def evaluate(self, event: SecurityEvent) -> bool:
        if event.event_type == "network_traffic" and event.status == "blocked":
            return True
        return False
