from app.services.detection.rules.base import DetectionRule
from app.models.event_model import SecurityEvent

class SuspiciousMacExecutionRule(DetectionRule):
    @property
    def metadata(self):
        return {
            "rule_id": "rule_mac_execution_001",
            "name": "Suspicious Unix Shell Execution",
            "version": "1.0",
            "severity": "high",
            "confidence": 85,
            "description": "Detects suspicious piping of remote content into a Unix shell (e.g., curl | bash).",
            "enabled": True
        }

    async def evaluate(self, event: SecurityEvent) -> bool:
        if event.event_type == "process_creation" and event.process_name:
            proc_name = event.process_name.lower()
            if proc_name.endswith("bash") or proc_name.endswith("sh"):
                if event.command_line:
                    cmd = event.command_line.lower()
                    if "curl" in cmd or "wget" in cmd:
                        return True
        return False
