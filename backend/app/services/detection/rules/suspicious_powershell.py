from app.services.detection.rules.base import DetectionRule
from app.models.event_model import SecurityEvent

class SuspiciousPowerShellRule(DetectionRule):
    @property
    def metadata(self):
        return {
            "rule_id": "rule_powershell_001",
            "name": "Suspicious PowerShell Execution",
            "version": "1.0",
            "severity": "critical",
            "confidence": 90,
            "description": "Detects encoded or hidden PowerShell commands indicative of malicious activity.",
            "enabled": True
        }

    async def evaluate(self, event: SecurityEvent) -> bool:
        if event.event_type == "process_creation" and event.process_name and "powershell.exe" in event.process_name.lower():
            cmd = event.command_line.lower() if event.command_line else ""
            if "-encodedcommand" in cmd or "-windowstyle hidden" in cmd or "-executionpolicy bypass" in cmd:
                return True
        return False
