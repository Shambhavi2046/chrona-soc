from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.services.organization import organization_service
from app.schemas.organization import OrganizationResponse, OrganizationCreate
from app.middleware.auth import require_permissions
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("", response_model=List[OrganizationResponse])
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    _=Depends(require_permissions(["users:read"]))
):
    return await organization_service.repository.get_all(db, skip=pagination.skip, limit=pagination.limit)

@router.post("", response_model=OrganizationResponse)
async def create_organization(
    org_in: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(["users:write"]))
):
    return await organization_service.create_org(db, org_in)
