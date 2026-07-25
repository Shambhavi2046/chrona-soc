from app.utils.logger import logger


def analyze_threat(event: str, severity: str):

    event_lower = event.lower()

    threat = {
        "threat_detected": False,
        "threat_type": "None",
        "risk_score": 0,
        "recommendation": "No immediate action required"
    }

    if "failed login" in event_lower or "multiple login attempts" in event_lower:
        threat = {
            "threat_detected": True,
            "threat_type": "Brute Force Attack",
            "risk_score": 85,
            "recommendation": "Investigate source IP and user activity"
        }

    elif "malware" in event_lower or "virus" in event_lower:
        threat = {
            "threat_detected": True,
            "threat_type": "Malware Activity",
            "risk_score": 95,
            "recommendation": "Isolate affected system immediately"
        }

    elif severity.lower() == "high":
        threat = {
            "threat_detected": True,
            "threat_type": "High Severity Event",
            "risk_score": 70,
            "recommendation": "Review event details"
        }

    logger.info(
        f"Threat analysis completed | Type: {threat['threat_type']} | Risk: {threat['risk_score']}"
    )

    return threat