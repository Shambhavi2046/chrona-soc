from app.utils.logger import logger


def investigate_threat(threat_type: str, risk_score: int):

    investigation = {
        "analysis": "No detailed investigation available.",
        "recommendations": []
    }


    if threat_type == "Brute Force Attack":

        investigation = {
            "analysis": (
                "Multiple failed authentication attempts suggest "
                "possible brute-force behaviour against a user account."
            ),
            "recommendations": [
                "Review source IP activity",
                "Check affected user accounts",
                "Enable account protection measures"
            ]
        }


    elif threat_type == "Malware Activity":

        investigation = {
            "analysis": (
                "The event indicates possible malicious software activity "
                "on the affected system."
            ),
            "recommendations": [
                "Isolate affected machine",
                "Run security scan",
                "Investigate file activity"
            ]
        }


    elif risk_score >= 70:

        investigation = {
            "analysis": (
                "High-risk security event detected requiring analyst review."
            ),
            "recommendations": [
                "Review event details",
                "Check related activity logs"
            ]
        }


    logger.info(
        f"Investigation completed | Threat: {threat_type}"
    )

    return investigation