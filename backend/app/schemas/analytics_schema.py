from pydantic import BaseModel
from typing import List, Dict, Any

class KPIStats(BaseModel):
    totalIncidents: int
    activeIncidents: int
    criticalIncidents: int
    highSeverityAlerts: int
    openInvestigations: int
    activeThreats: int
    highRiskAssets: int
    securityScore: int
    overallRiskScore: int
    threatIntelMatches: int
    mttd: str  # Mean Time To Detect
    mttr: str  # Mean Time To Respond

class TrendPoint(BaseModel):
    timestamp: str
    count: int

class SeverityCount(BaseModel):
    severity: str
    count: int

class TacticCount(BaseModel):
    tactic: str
    count: int

class MitreAnalytics(BaseModel):
    topTactics: List[TacticCount]

class AssetRisk(BaseModel):
    asset: str
    riskScore: int
    incidents: int

class GeographicCount(BaseModel):
    country: str
    count: int

class AlertAnalytics(BaseModel):
    open: int
    closed: int
    falsePositive: int
    suppressed: int

class AnalyticsResponse(BaseModel):
    kpis: KPIStats
    attackTrends: List[TrendPoint]
    threatSeverity: List[SeverityCount]
    mitreAnalytics: MitreAnalytics
    assetRisk: List[AssetRisk]
    geographicAnalytics: List[GeographicCount]
    alertAnalytics: AlertAnalytics
    aiInsights: List[str]
