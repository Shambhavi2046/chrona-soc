from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.services.operations import investigation_service
from app.schemas.operations import InvestigationCreate, InvestigationUpdate, InvestigationResponse
from app.middleware.auth import require_permissions
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("/summary/overview")
async def get_overview_summary(
    db: AsyncSession = Depends(get_db)
):
    return await investigation_service.generate_overview_summary(db)

@router.get("", response_model=List[InvestigationResponse])
async def list_investigations(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination)
):
    return await investigation_service.repository.get_all_paginated(db, skip=pagination.skip, limit=pagination.limit)

@router.get("/by-alert/{alert_id}", response_model=InvestigationResponse)
async def get_investigation_by_alert(
    alert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    return await investigation_service.get_or_create_by_alert_id(db, alert_id)

@router.post("", response_model=InvestigationResponse)
async def create_investigation(
    obj_in: InvestigationCreate,
    db: AsyncSession = Depends(get_db)
):
    return await investigation_service.create_investigation(db, obj_in)

@router.get("/{id}", response_model=InvestigationResponse)
async def get_investigation(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    return await investigation_service.get_by_id(db, id)

@router.patch("/{id}", response_model=InvestigationResponse)
async def update_investigation(
    id: uuid.UUID,
    obj_in: InvestigationUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await investigation_service.update_investigation(db, id, obj_in)
