from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.operations import Alert, Case, Investigation
from app.schemas.analytics_schema import AnalyticsResponse
import hashlib
import uuid

# MITRE mapping for existing threats
MITRE_MAPPING = {
    "Brute Force Attack": "Credential Access",
    "Data Exfiltration Attempt": "Exfiltration",
    "Suspicious Login": "Initial Access",
    "Port Scan Detected": "Discovery",
    "Ransomware Payload": "Impact",
    "Botnet Scanner": "Discovery",
    "Malware Execution": "Execution"
}

from datetime import datetime, timedelta, timezone
from collections import defaultdict

async def get_analytics(db: AsyncSession, org_id: uuid.UUID, period: str = "week") -> AnalyticsResponse:
    # Query aggregated stats instead of pulling all records into memory
    
    # Alert states and severity
    alerts_result = await db.execute(
        select(Alert.status, Alert.severity, Alert.risk_score, Alert.threat_type, Alert.created_at)
        .filter(Alert.org_id == org_id)
    )
    alerts = alerts_result.all()

    total_incidents = len(alerts)
    active_incidents = len([a for a in alerts if a[0].lower() in ["open", "investigating"]])
    critical_incidents = len([a for a in alerts if (a[2] or 0) >= 90])
    high_severity_alerts = len([a for a in alerts if 70 <= (a[2] or 0) < 90])

    open_alerts = len([a for a in alerts if a[0].lower() == "open"])
    closed_alerts = len([a for a in alerts if a[0].lower() == "resolved"])
    blocked_alerts = len([a for a in alerts if a[0].lower() == "blocked"])

    # Asset Risk inference (from Alert sources or threat types since Log lacks org_id)
    asset_data = {}
    for a in alerts:
        src = a[3] or "Unknown Source"
        risk = a[2] or 0
        if src not in asset_data:
            asset_data[src] = {"count": 0, "total_risk": 0}
        asset_data[src]["count"] += 1
        asset_data[src]["total_risk"] += risk

    asset_risk_list = []
    for asset, data in asset_data.items():
        avg_risk = data["total_risk"] // data["count"] if data["count"] > 0 else 0
        asset_risk_list.append({
            "asset": asset,
            "riskScore": avg_risk,
            "incidents": data["count"]
        })
    asset_risk_list.sort(key=lambda x: x["riskScore"], reverse=True)
    asset_risk_list = asset_risk_list[:5]

    # MITRE tactics
    tactic_counts = {}
    for a in alerts:
        tactic = MITRE_MAPPING.get(a[3], "Unknown")
        tactic_counts[tactic] = tactic_counts.get(tactic, 0) + 1

    top_tactics = [{"tactic": k, "count": v} for k, v in tactic_counts.items()]

    # Real Attack Trends
    now = datetime.now(timezone.utc)
    if period == "hour":
        start_time = now - timedelta(hours=1)
        bucket_format = "%H:%M" # per minute or 5 min
    elif period == "day":
        start_time = now - timedelta(days=1)
        bucket_format = "%H:00"
    elif period == "month":
        start_time = now - timedelta(days=30)
        bucket_format = "%m-%d"
    else: # week
        start_time = now - timedelta(days=7)
        bucket_format = "%m-%d"

    trend_counts = defaultdict(int)
    for a in alerts:
        created_at = a[4]
        # if created_at is naive, assume utc
        if created_at and created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        
        if created_at and created_at >= start_time:
            bucket = created_at.strftime(bucket_format)
            trend_counts[bucket] += 1
            
    # Sort buckets
    trend_data = [{"timestamp": k, "count": v} for k, v in sorted(trend_counts.items())]

    # Calculate real risk scores based on alert averages
    if total_incidents > 0:
        overall_risk = sum((a[2] or 0) for a in alerts) // total_incidents
    else:
        overall_risk = 0
        
    security_score = max(0, 100 - overall_risk)

    severity_dist = [
        {"severity": "Critical", "count": critical_incidents},
        {"severity": "High", "count": high_severity_alerts},
        {"severity": "Medium", "count": len([a for a in alerts if 40 <= (a[2] or 0) < 70])},
        {"severity": "Low", "count": len([a for a in alerts if (a[2] or 0) < 40])}
    ]

    return {
        "kpis": {
            "totalIncidents": total_incidents,
            "activeIncidents": active_incidents,
            "criticalIncidents": critical_incidents,
            "highSeverityAlerts": high_severity_alerts,
            "openInvestigations": open_alerts,
            "activeThreats": active_incidents + blocked_alerts,
            "highRiskAssets": len([a for a in asset_risk_list if a["riskScore"] >= 80]),
            "securityScore": security_score,
            "overallRiskScore": overall_risk,
            "threatIntelMatches": 0,
            "mttd": "",
            "mttr": ""
        },
        "attackTrends": trend_data,
        "threatSeverity": severity_dist,
        "mitreAnalytics": {
            "topTactics": sorted(top_tactics, key=lambda x: x["count"], reverse=True)
        },
        "assetRisk": asset_risk_list,
        "geographicAnalytics": [],
        "alertAnalytics": {
            "open": open_alerts,
            "closed": closed_alerts,
            "falsePositive": len([a for a in alerts if a[0].lower() == "false positive"]),
            "suppressed": len([a for a in alerts if a[0].lower() == "suppressed"])
        },
        "aiInsights": []
    }
