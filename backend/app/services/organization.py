from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy import select
from app.services.base import BaseService
from app.repositories.organization import OrganizationRepository, organization_repo
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from app.core.exceptions import BadRequestException
import uuid

class OrganizationService(BaseService[OrganizationRepository]):
    async def create_org(self, db: AsyncSession, org_in: OrganizationCreate) -> dict:
        existing = await self.repository.get_by_name(db, org_in.name)
        if existing:
            raise BadRequestException("Organization with this name already exists")
            
        return await self.repository.create(db, obj_in=org_in)

organization_service = OrganizationService(organization_repo)
