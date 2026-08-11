from typing import Any, Optional, List, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.repositories.base import BaseRepository
from app.models.operations import IOC, ThreatFeed, ThreatActor, Malware
from app.db.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)

class ThreatIntelBaseRepository(BaseRepository[ModelType]):
    """
    Base repository for Threat Intelligence entities.
    Overrides read methods to return BOTH tenant-owned (org_id = current_org)
    AND global/shared intelligence (org_id IS NULL).
    """
    async def get(self, db: AsyncSession, id: Any, org_id: Optional[Any] = None) -> Optional[ModelType]:
        query = select(self.model).filter(self.model.id == id)
        if org_id and hasattr(self.model, 'org_id'):
            # Allow reading if it belongs to the tenant OR if it is global
            query = query.filter(or_(self.model.org_id == org_id, self.model.org_id.is_(None)))
        result = await db.execute(query)
        return result.scalars().first()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100, org_id: Optional[Any] = None) -> List[ModelType]:
        query = select(self.model)
        if org_id and hasattr(self.model, 'org_id'):
            # Allow reading if it belongs to the tenant OR if it is global
            query = query.filter(or_(self.model.org_id == org_id, self.model.org_id.is_(None)))
        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()

class IOCRepository(ThreatIntelBaseRepository[IOC]):
    def __init__(self):
        super().__init__(IOC)
        
    async def get_all(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100, 
        org_id: Optional[Any] = None,
        search: Optional[str] = None
    ) -> List[IOC]:
        query = select(self.model)
        if org_id and hasattr(self.model, 'org_id'):
            # Allow reading if it belongs to the tenant OR if it is global
            query = query.filter(or_(self.model.org_id == org_id, self.model.org_id.is_(None)))
            
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    self.model.value.ilike(search_pattern),
                    self.model.type.ilike(search_pattern),
                    self.model.category.ilike(search_pattern),
                    self.model.source.ilike(search_pattern)
                )
            )
            
        # Deterministic ordering
        query = query.order_by(self.model.created_at.desc(), self.model.id)
        
        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()

class ThreatFeedRepository(ThreatIntelBaseRepository[ThreatFeed]):
    def __init__(self):
        super().__init__(ThreatFeed)

class ThreatActorRepository(ThreatIntelBaseRepository[ThreatActor]):
    def __init__(self):
        super().__init__(ThreatActor)

class MalwareRepository(ThreatIntelBaseRepository[Malware]):
    def __init__(self):
        super().__init__(Malware)

ioc_repo = IOCRepository()
threat_feed_repo = ThreatFeedRepository()
threat_actor_repo = ThreatActorRepository()
malware_repo = MalwareRepository()
