from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.services.user import user_service
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.middleware.auth import require_permissions
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("", response_model=List[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination)
):
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.identity import User
    
    result = await db.execute(
        select(User).options(selectinload(User.roles)).offset(pagination.skip).limit(pagination.limit)
    )
    return result.scalars().all()

@router.post("", response_model=UserResponse)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(["users:write"]))
):
    return await user_service.create_user(db, user_in)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(["users:read"]))
):
    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(["users:write"]))
):
    return await user_service.update_user(db, user_id, user_in)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(["users:write"]))
):
    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_deleted = True
    db.add(user)
    await db.commit()
    return None
