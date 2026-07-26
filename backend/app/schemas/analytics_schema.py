from pydantic import BaseModel, Field
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
    topTactics: List[TacticCount] = Field(default_factory=list)

class AssetRisk(BaseModel):
    asset: str
    riskScore: int
    incidents: int

class GeographicCount(BaseModel):
    country: str
    count: int

class AlertAnalytics(BaseModel):
    open: int = 0
    closed: int = 0
    falsePositive: int = 0
    suppressed: int = 0

class AnalyticsResponse(BaseModel):
    kpis: KPIStats
    attackTrends: List[TrendPoint] = Field(default_factory=list)
    threatSeverity: List[SeverityCount] = Field(default_factory=list)
    mitreAnalytics: MitreAnalytics = Field(default_factory=lambda: MitreAnalytics(topTactics=[]))
    assetRisk: List[AssetRisk] = Field(default_factory=list)
    geographicAnalytics: List[GeographicCount] = Field(default_factory=list)
    alertAnalytics: AlertAnalytics = Field(default_factory=lambda: AlertAnalytics(open=0, closed=0, falsePositive=0, suppressed=0))
    aiInsights: List[str] = Field(default_factory=list)
