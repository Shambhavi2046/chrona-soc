from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.services.base import BaseService
from app.repositories.role import RoleRepository, role_repo
from app.schemas.role import RoleCreate, RoleUpdate
from app.core.exceptions import BadRequestException
import uuid

class RoleService(BaseService[RoleRepository]):
    async def create_role(self, db: AsyncSession, role_in: RoleCreate, org_id: uuid.UUID) -> dict:
        existing = await self.repository.get_by_name(db, role_in.name)
        if existing and (existing.org_id == org_id or existing.org_id is None):
            raise BadRequestException("Role with this name already exists")
            
        return await self.repository.create(db, obj_in=role_in, org_id=org_id)

    async def update_role(self, db: AsyncSession, role_id: uuid.UUID, role_in: RoleUpdate, org_id: uuid.UUID) -> dict:
        db_role = await self.repository.get(db, role_id)
        if not db_role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
            
        if db_role.org_id is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify global system roles")
            
        if str(db_role.org_id) != str(org_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
            
        update_data = role_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_role, field, value)
            
        db.add(db_role)
        await db.commit()
        await db.refresh(db_role)
        return db_role

role_service = RoleService(role_repo)
