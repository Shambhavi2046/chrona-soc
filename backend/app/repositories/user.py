from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.identity import User, Role

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(
            select(self.model)
            .options(selectinload(self.model.roles))
            .filter(self.model.email == email, self.model.is_deleted == False)
        )
        return result.scalars().first()

    async def get_with_roles(self, db: AsyncSession, id: str) -> Optional[User]:
        result = await db.execute(
            select(self.model)
            .options(selectinload(self.model.roles))
            .filter(self.model.id == id, self.model.is_deleted == False)
        )
        return result.scalars().first()

user_repo = UserRepository()
