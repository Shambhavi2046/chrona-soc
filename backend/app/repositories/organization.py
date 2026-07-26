from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.identity import Organization

class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self):
        super().__init__(Organization)

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Organization]:
        result = await db.execute(select(self.model).filter(self.model.name == name, self.model.is_deleted == False))
        return result.scalars().first()

organization_repo = OrganizationRepository()
