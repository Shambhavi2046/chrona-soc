from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.services.user import user_service
from app.schemas.user import UserCreate, UserUpdate, UserResponse, ProfileUpdate
from app.middleware.auth import require_permissions, get_current_user
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("", response_model=List[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    current_user = Depends(require_permissions(["users:read"]))
):
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.identity import User
    
    result = await db.execute(
        select(User)
        .filter(User.org_id == current_user.org_id, User.is_deleted == False)
        .options(selectinload(User.roles))
        .offset(pagination.skip)
        .limit(pagination.limit)
    )
    return result.scalars().all()

@router.post("", response_model=UserResponse)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_permissions(["users:write"]))
):
    return await user_service.create_user(db, user_in, current_user.org_id)

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy.orm import selectinload
    from sqlalchemy import select
    from app.models.identity import User

    result = await db.execute(
        select(User)
        .filter(User.id == current_user.id, User.is_deleted == False)
        .options(selectinload(User.roles))
    )
    user = result.scalars().first()
    if not user:
        print("IN ROUTE GET_USER" if "user_id" in locals() else "IN ROUTE UPDATE_MY_PROFILE", flush=True); raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    profile_in: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy.orm import selectinload
    from sqlalchemy import select
    from app.models.identity import User

    result = await db.execute(
        select(User)
        .filter(User.id == current_user.id, User.is_deleted == False)
        .options(selectinload(User.roles))
    )
    user = result.scalars().first()
    if not user:
        print("IN ROUTE GET_USER" if "user_id" in locals() else "IN ROUTE UPDATE_MY_PROFILE", flush=True); raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if profile_in.name is not None:
        user.name = profile_in.name
    
    db.add(user)
    await db.commit()
    
    result = await db.execute(
        select(User)
        .filter(User.id == current_user.id)
        .options(selectinload(User.roles))
    )
    user = result.scalars().first()
    return user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_permissions(["users:read"]))
):
    user = await user_service.get_by_id(db, user_id)
    if not user or str(user.org_id) != str(current_user.org_id) or user.is_deleted:
        print("IN ROUTE GET_USER" if "user_id" in locals() else "IN ROUTE UPDATE_MY_PROFILE", flush=True); raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_permissions(["users:write"]))
):
    user = await user_service.get_by_id(db, user_id)
    if not user or str(user.org_id) != str(current_user.org_id) or user.is_deleted:
        print("IN ROUTE GET_USER" if "user_id" in locals() else "IN ROUTE UPDATE_MY_PROFILE", flush=True); raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await user_service.update_user(db, user_id, user_in, current_user.org_id)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_permissions(["users:write"]))
):
    user = await user_service.get_by_id(db, user_id)
    if not user or str(user.org_id) != str(current_user.org_id) or user.is_deleted:
        print("IN ROUTE GET_USER" if "user_id" in locals() else "IN ROUTE UPDATE_MY_PROFILE", flush=True); raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_deleted = True
    db.add(user)
    await db.commit()
    return None
