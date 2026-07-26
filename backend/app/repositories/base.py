from typing import Generic, TypeVar, Type, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        result = await db.execute(select(self.model).filter(self.model.id == id))
        return result.scalars().first()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create(self, db: AsyncSession, *, obj_in: Any) -> ModelType:
        obj_in_data = obj_in.dict(exclude_unset=True)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
