from typing import Generic, TypeVar, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository

RepoType = TypeVar("RepoType", bound=BaseRepository)

class BaseService(Generic[RepoType]):
    def __init__(self, repository: RepoType):
        self.repository = repository

    async def get_by_id(self, db: AsyncSession, id: Any, org_id: Optional[Any] = None):
        return await self.repository.get(db, id, org_id)
