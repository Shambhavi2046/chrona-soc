from typing import List, Optional, Dict, Any
import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.sqlite import insert

from app.models.event_model import SecurityEvent
from app.schemas.events import EventCreate

class EventRepository:

    async def ingest_single(self, db: AsyncSession, event_in: EventCreate, org_id: uuid.UUID) -> Optional[SecurityEvent]:
        """Insert a single event. Ignores if event_id already exists."""
        values = event_in.model_dump()
        values['tenant_id'] = org_id
        stmt = insert(SecurityEvent).values(**values)
        stmt = stmt.on_conflict_do_nothing(index_elements=['event_id'])

        await db.execute(stmt)
        await db.commit()

        # Fetch the inserted (or existing) record, scoped to the tenant
        result = await db.execute(
            select(SecurityEvent).where(
                SecurityEvent.event_id == event_in.event_id,
                SecurityEvent.tenant_id == org_id
            )
        )
        return result.scalars().first()

    async def ingest_bulk(self, db: AsyncSession, events_in: List[EventCreate], org_id: uuid.UUID) -> int:
        """Bulk insert events, ignoring duplicates."""
        if not events_in:
            return 0

        values = [event.model_dump() for event in events_in]
        for val in values:
            val['tenant_id'] = org_id
        stmt = insert(SecurityEvent).values(values)
        stmt = stmt.on_conflict_do_nothing(index_elements=['event_id'])

        result = await db.execute(stmt)
        await db.commit()

        return result.rowcount

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID, org_id: Optional[uuid.UUID] = None) -> Optional[SecurityEvent]:
        query = select(SecurityEvent).where(SecurityEvent.id == id)
        if org_id:
            query = query.where(SecurityEvent.tenant_id == org_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def search(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        severity: Optional[str] = None,
        source: Optional[str] = None,
        hostname: Optional[str] = None,
        user_account: Optional[str] = None,
        start_time: Optional[Any] = None,
        end_time: Optional[Any] = None,
        org_id: Optional[uuid.UUID] = None
    ) -> List[SecurityEvent]:
        query = select(SecurityEvent)

        if org_id:
            query = query.where(SecurityEvent.tenant_id == org_id)
        if severity:
            query = query.where(SecurityEvent.severity == severity)
        if source:
            query = query.where(SecurityEvent.source == source)
        if hostname:
            query = query.where(SecurityEvent.hostname == hostname)
        if user_account:
            query = query.where(SecurityEvent.user_account == user_account)
        if start_time:
            query = query.where(SecurityEvent.timestamp >= start_time)
        if end_time:
            query = query.where(SecurityEvent.timestamp <= end_time)

        query = query.order_by(SecurityEvent.timestamp.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_stats(self, db: AsyncSession, org_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        """Aggregate stats for dashboard/analytics"""
        base_query = select(SecurityEvent.severity, func.count(SecurityEvent.id)).group_by(SecurityEvent.severity)
        source_query = select(SecurityEvent.source, func.count(SecurityEvent.id)).group_by(SecurityEvent.source)
        total_query = select(func.count(SecurityEvent.id))

        if org_id:
            base_query = base_query.where(SecurityEvent.tenant_id == org_id)
            source_query = source_query.where(SecurityEvent.tenant_id == org_id)
            total_query = total_query.where(SecurityEvent.tenant_id == org_id)

        # Count by severity
        severity_result = await db.execute(base_query)
        severity_counts = {row[0]: row[1] for row in severity_result.all()}

        # Count by source
        source_result = await db.execute(source_query)
        source_counts = {row[0]: row[1] for row in source_result.all()}

        # Total events
        total_result = await db.execute(total_query)
        total = total_result.scalar()

        return {
            "total_events": total,
            "by_severity": severity_counts,
            "by_source": source_counts
        }

event_repository = EventRepository()
