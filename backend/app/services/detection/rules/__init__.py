from typing import List
from app.services.detection.rules.base import DetectionRule
from app.services.detection.rules.brute_force import BruteForceRule
from app.services.detection.rules.suspicious_powershell import SuspiciousPowerShellRule
from app.services.detection.rules.malicious_network import MaliciousNetworkRule

class RuleRegistry:
    def __init__(self):
        self._rules: List[DetectionRule] = []
        self._load_rules()
        
    def _load_rules(self):
        """Register all enabled rules."""
        candidate_rules = [
            BruteForceRule(),
            SuspiciousPowerShellRule(),
            MaliciousNetworkRule()
        ]
        
        for rule in candidate_rules:
            if rule.metadata.get("enabled", False):
                self._rules.append(rule)
                
    def get_all_rules(self) -> List[DetectionRule]:
        return self._rules

rule_registry = RuleRegistry()
