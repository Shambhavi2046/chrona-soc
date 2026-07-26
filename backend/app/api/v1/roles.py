from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.services.role import role_service
from app.schemas.role import RoleResponse, RoleCreate
from app.middleware.auth import require_permissions
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("", response_model=List[RoleResponse])
async def list_roles(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    _=Depends(require_permissions(["roles:read"]))
):
    return await role_service.repository.get_all(db, skip=pagination.skip, limit=pagination.limit)

@router.post("", response_model=RoleResponse)
async def create_role(
    role_in: RoleCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(["roles:write"]))
):
    return await role_service.create_role(db, role_in)
