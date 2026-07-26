from typing import List, Dict, Any
from pydantic import BaseModel

class DashboardSummary(BaseModel):
    total_alerts: int
    critical_alerts: int
    open_cases: int
    active_playbooks: int
    threat_intel_hits: int
    avg_mttr_hours: float

class DashboardTrend(BaseModel):
    date: str
    count: int

class DashboardMetrics(BaseModel):
    alerts_by_severity: Dict[str, int]
    alerts_trend: List[DashboardTrend]
    top_mitre_tactics: Dict[str, int]
