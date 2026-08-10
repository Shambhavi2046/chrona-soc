from typing import Generic, TypeVar, Type, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: Any, org_id: Optional[Any] = None) -> Optional[ModelType]:
        query = select(self.model).filter(self.model.id == id)
        if org_id and hasattr(self.model, 'org_id'):
            query = query.filter(self.model.org_id == org_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100, org_id: Optional[Any] = None) -> List[ModelType]:
        query = select(self.model)
        if org_id and hasattr(self.model, 'org_id'):
            query = query.filter(self.model.org_id == org_id)
        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create(self, db: AsyncSession, *, obj_in: Any, org_id: Optional[Any] = None) -> ModelType:
        obj_in_data = obj_in.dict(exclude_unset=True)
        if org_id and hasattr(self.model, 'org_id') and "org_id" not in obj_in_data:
            obj_in_data["org_id"] = org_id
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
