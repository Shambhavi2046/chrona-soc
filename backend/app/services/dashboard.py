from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.operations import Alert, Case
from app.models.automation import Playbook
from app.schemas.dashboard import DashboardSummary, DashboardMetrics, DashboardTrend

import uuid
from datetime import datetime, timedelta

class DashboardService:
    async def get_summary(self, db: AsyncSession, org_id: uuid.UUID) -> DashboardSummary:
        # Count total alerts
        total_alerts = await db.scalar(select(func.count(Alert.id)).filter(Alert.org_id == org_id)) or 0
        critical_alerts = await db.scalar(select(func.count(Alert.id)).filter(Alert.org_id == org_id, Alert.severity == "Critical")) or 0
        open_cases = await db.scalar(select(func.count(Case.id)).filter(Case.org_id == org_id, Case.status == "Open")) or 0
        active_playbooks = await db.scalar(select(func.count(Playbook.id)).filter(Playbook.org_id == org_id, Playbook.status == "Active")) or 0

        # We can implement threat intel hits by looking at alerts with threat_intel tags or just returning 0
        threat_intel_hits = 0
        avg_mttr_hours = 0.0 # Requires tracking resolution time of cases

        return DashboardSummary(
            total_alerts=total_alerts,
            critical_alerts=critical_alerts,
            open_cases=open_cases,
            active_playbooks=active_playbooks,
            threat_intel_hits=threat_intel_hits,
            avg_mttr_hours=avg_mttr_hours
        )

    async def get_metrics(self, db: AsyncSession, org_id: uuid.UUID) -> DashboardMetrics:
        # 1. Alerts by severity
        severity_result = await db.execute(
            select(Alert.severity, func.count(Alert.id))
            .filter(Alert.org_id == org_id)
            .group_by(Alert.severity)
        )
        alerts_by_severity = {row[0] or "Unknown": row[1] for row in severity_result.all()}

        # 2. Alerts trend (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        # SQLite DATE() function works on ISO8601 timestamps
        trend_result = await db.execute(
            select(
                func.date(Alert.created_at).label("d"),
                func.count(Alert.id)
            )
            .filter(Alert.org_id == org_id, Alert.created_at >= seven_days_ago)
            .group_by("d")
            .order_by("d")
        )
        alerts_trend = [
            DashboardTrend(date=str(row[0]), count=row[1])
            for row in trend_result.all() if row[0]
        ]

        # 3. Top Mitre Tactics (assuming we map threat_type or category to Mitre, but let's query threat_type for now)
        tactic_result = await db.execute(
            select(Alert.threat_type, func.count(Alert.id))
            .filter(Alert.org_id == org_id, Alert.threat_type != None)
            .group_by(Alert.threat_type)
            .order_by(func.count(Alert.id).desc())
            .limit(5)
        )
        top_mitre_tactics = {row[0]: row[1] for row in tactic_result.all()}

        return DashboardMetrics(
            alerts_by_severity=alerts_by_severity,
            alerts_trend=alerts_trend,
            top_mitre_tactics=top_mitre_tactics
        )

dashboard_service = DashboardService()
