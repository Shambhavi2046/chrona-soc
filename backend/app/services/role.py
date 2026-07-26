from sqlalchemy.ext.asyncio import AsyncSession
from app.services.base import BaseService
from app.repositories.role import RoleRepository, role_repo
from app.schemas.role import RoleCreate
from app.core.exceptions import BadRequestException
import uuid

class RoleService(BaseService[RoleRepository]):
    async def create_role(self, db: AsyncSession, role_in: RoleCreate) -> dict:
        existing = await self.repository.get_by_name(db, role_in.name)
        if existing:
            raise BadRequestException("Role with this name already exists")
            
        return await self.repository.create(db, obj_in=role_in)

role_service = RoleService(role_repo)
