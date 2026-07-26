from typing import Dict, List, Any

# Separating MITRE logic from rules as requested
MITRE_MAPPING = {
    "rule_brute_force_001": [
        {"tactic": "Credential Access", "tactic_id": "TA0006", "technique": "Brute Force", "technique_id": "T1110"}
    ],
    "rule_powershell_001": [
        {"tactic": "Execution", "tactic_id": "TA0002", "technique": "Command and Scripting Interpreter: PowerShell", "technique_id": "T1059.001"},
        {"tactic": "Defense Evasion", "tactic_id": "TA0005", "technique": "Obfuscated Files or Information", "technique_id": "T1027"}
    ],
    "rule_network_001": [
        {"tactic": "Command and Control", "tactic_id": "TA0011", "technique": "Application Layer Protocol", "technique_id": "T1071"}
    ]
}

class MitreMappingService:
    @staticmethod
    def get_mapping(rule_id: str) -> List[Dict[str, Any]]:
        return MITRE_MAPPING.get(rule_id, [])

mitre_mapping_service = MitreMappingService()
