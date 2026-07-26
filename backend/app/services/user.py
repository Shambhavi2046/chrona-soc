from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.services.base import BaseService
from app.repositories.user import UserRepository, user_repo
from app.repositories.organization import organization_repo
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.core.exceptions import BadRequestException
from app.models.identity import UserRole
import uuid

class UserService(BaseService[UserRepository]):
    async def create_user(self, db: AsyncSession, user_in: UserCreate) -> dict:
        # Check if email exists
        existing_user = await self.repository.get_by_email(db, user_in.email)
        if existing_user:
            raise BadRequestException("User with this email already exists")
            
        # Check org exists
        org = await organization_repo.get(db, user_in.org_id)
        if not org:
            raise BadRequestException("Organization does not exist")

        db_user = self.repository.model(
            email=user_in.email,
            name=user_in.name,
            hashed_password=get_password_hash(user_in.password),
            org_id=user_in.org_id,
            status=user_in.status,
            mfa_enabled=user_in.mfa_enabled
        )
        db.add(db_user)
        await db.flush() # get db_user.id
        
        # Add roles
        for role_id in user_in.role_ids:
            db.add(UserRole(user_id=db_user.id, role_id=role_id))
            
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def update_user(self, db: AsyncSession, user_id: uuid.UUID, user_in: UserUpdate) -> dict:
        db_user = await self.repository.get(db, user_id)
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        update_data = user_in.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
            
        # roles update not handled here for simplicity in this iteration
        if "role_ids" in update_data:
            update_data.pop("role_ids")
            
        for field, value in update_data.items():
            setattr(db_user, field, value)
            
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

user_service = UserService(user_repo)
