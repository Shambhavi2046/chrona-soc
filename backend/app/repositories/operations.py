from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.operations import Alert, Investigation, Case, Evidence, TimelineEvent
from app.models.identity import User

class AlertRepository(BaseRepository[Alert]):
    def __init__(self):
        super().__init__(Alert)

    async def get_all_paginated(self, db: AsyncSession, skip: int = 0, limit: int = 100, status: Optional[str] = None, severity: Optional[str] = None) -> List[Alert]:
        query = select(self.model).order_by(desc(self.model.created_at))
        if status:
            query = query.filter(self.model.status == status)
        if severity:
            query = query.filter(self.model.severity == severity)
            
        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
        
    async def get_recent(self, db: AsyncSession, limit: int = 5) -> List[Alert]:
        query = select(self.model).order_by(desc(self.model.created_at)).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

class InvestigationRepository(BaseRepository[Investigation]):
    def __init__(self):
        super().__init__(Investigation)
        
    async def get(self, db: AsyncSession, id: Any) -> Optional[Investigation]:
        query = select(self.model).options(
            selectinload(self.model.alert),
            selectinload(self.model.assignee).selectinload(User.roles)
        ).filter(self.model.id == id)
        result = await db.execute(query)
        return result.scalars().first()
        
    async def get_all_paginated(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Investigation]:
        query = select(self.model).options(
            selectinload(self.model.alert),
            selectinload(self.model.assignee).selectinload(User.roles)
        ).filter(self.model.is_deleted == False).order_by(desc(self.model.created_at))
        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()

    async def get_by_alert_id(self, db: AsyncSession, alert_id: Any) -> Optional[Investigation]:
        query = select(self.model).options(
            selectinload(self.model.alert),
            selectinload(self.model.assignee).selectinload(User.roles)
        ).filter(self.model.alert_id == alert_id, self.model.is_deleted == False)
        result = await db.execute(query)
        return result.scalars().first()

class CaseRepository(BaseRepository[Case]):
    def __init__(self):
        super().__init__(Case)

    async def get(self, db: AsyncSession, id: Any) -> Optional[Case]:
        query = select(self.model).options(
            selectinload(self.model.alerts),
            selectinload(self.model.timeline_events).selectinload(TimelineEvent.user),
            selectinload(self.model.evidence),
            selectinload(self.model.assignee).selectinload(User.roles)
        ).filter(self.model.id == id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_all_paginated(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Case]:
        query = select(self.model).options(
            selectinload(self.model.alerts),
            selectinload(self.model.timeline_events).selectinload(TimelineEvent.user),
            selectinload(self.model.evidence),
            selectinload(self.model.assignee).selectinload(User.roles)
        ).filter(self.model.is_deleted == False).order_by(desc(self.model.created_at))
        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()

class EvidenceRepository(BaseRepository[Evidence]):
    def __init__(self):
        super().__init__(Evidence)
        
    async def get_by_case(self, db: AsyncSession, case_id: str) -> List[Evidence]:
        query = select(self.model).filter(self.model.case_id == case_id).order_by(desc(self.model.created_at))
        result = await db.execute(query)
        return result.scalars().all()

alert_repo = AlertRepository()
investigation_repo = InvestigationRepository()
case_repo = CaseRepository()
evidence_repo = EvidenceRepository()
