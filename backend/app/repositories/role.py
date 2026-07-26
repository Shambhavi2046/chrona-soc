from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.identity import Role

class RoleRepository(BaseRepository[Role]):
    def __init__(self):
        super().__init__(Role)

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Role]:
        result = await db.execute(select(self.model).filter(self.model.name == name))
        return result.scalars().first()

role_repo = RoleRepository()
