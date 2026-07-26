from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.operations import Alert, Case
from app.models.automation import Playbook
from app.schemas.dashboard import DashboardSummary, DashboardMetrics, DashboardTrend

class DashboardService:
    async def get_summary(self, db: AsyncSession) -> DashboardSummary:
        # Count total alerts
        total_alerts = await db.scalar(select(func.count(Alert.id))) or 0
        critical_alerts = await db.scalar(select(func.count(Alert.id)).filter(Alert.severity == "Critical")) or 0
        open_cases = await db.scalar(select(func.count(Case.id)).filter(Case.status == "Open")) or 0
        active_playbooks = await db.scalar(select(func.count(Playbook.id)).filter(Playbook.status == "Active")) or 0
        
        return DashboardSummary(
            total_alerts=total_alerts,
            critical_alerts=critical_alerts,
            open_cases=open_cases,
            active_playbooks=active_playbooks,
            threat_intel_hits=120, # Mocked calculation for Phase 2D
            avg_mttr_hours=4.5 # Mocked calculation for Phase 2D
        )

    async def get_metrics(self, db: AsyncSession) -> DashboardMetrics:
        # Mocking complex aggregations for the moment to establish connectivity
        return DashboardMetrics(
            alerts_by_severity={"Critical": 12, "High": 45, "Medium": 89, "Low": 156},
            alerts_trend=[
                DashboardTrend(date="2023-10-01", count=45),
                DashboardTrend(date="2023-10-02", count=52),
                DashboardTrend(date="2023-10-03", count=38),
                DashboardTrend(date="2023-10-04", count=65),
                DashboardTrend(date="2023-10-05", count=48),
                DashboardTrend(date="2023-10-06", count=55),
                DashboardTrend(date="2023-10-07", count=41),
            ],
            top_mitre_tactics={
                "Initial Access": 24,
                "Execution": 18,
                "Persistence": 12,
                "Privilege Escalation": 8,
                "Defense Evasion": 15
            }
        )

dashboard_service = DashboardService()
