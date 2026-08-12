from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.services.role import role_service
from app.schemas.role import RoleResponse, RoleCreate, RoleUpdate
from app.middleware.auth import require_permissions
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("", response_model=List[RoleResponse])
async def list_roles(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    current_user = Depends(require_permissions(["roles:read"]))
):
    from sqlalchemy import select, or_
    from app.models.identity import Role
    
    result = await db.execute(
        select(Role).filter(or_(Role.org_id == current_user.org_id, Role.org_id == None))
        .offset(pagination.skip).limit(pagination.limit)
    )
    return result.scalars().all()

@router.post("", response_model=RoleResponse)
async def create_role(
    role_in: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_permissions(["roles:write"]))
):
    return await role_service.create_role(db, role_in, current_user.org_id)

@router.patch("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: str,
    role_in: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_permissions(["roles:write"]))
):
    import uuid
    try:
        role_uuid = uuid.UUID(role_id)
    except ValueError:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role ID format")
    
    return await role_service.update_role(db, role_uuid, role_in, current_user.org_id)
