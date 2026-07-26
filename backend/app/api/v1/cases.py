from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.services.operations import case_service, evidence_service
from app.schemas.operations import CaseCreate, CaseUpdate, CaseResponse, EvidenceCreate, EvidenceResponse, TimelineEventCreate, TimelineEventResponse
from app.middleware.auth import require_permissions
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("", response_model=List[CaseResponse])
async def list_cases(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination)
):
    return await case_service.repository.get_all_paginated(db, skip=pagination.skip, limit=pagination.limit)

@router.post("", response_model=CaseResponse)
async def create_case(
    obj_in: CaseCreate,
    db: AsyncSession = Depends(get_db)
):
    return await case_service.create_case(db, obj_in)

@router.get("/{id}", response_model=CaseResponse)
async def get_case(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    return await case_service.get_by_id(db, id)

@router.patch("/{id}", response_model=CaseResponse)
async def update_case(
    id: uuid.UUID,
    obj_in: CaseUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await case_service.update_case(db, id, obj_in)

@router.get("/{id}/evidence", response_model=List[EvidenceResponse])
async def list_evidence(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    return await evidence_service.repository.get_by_case(db, str(id))

@router.post("/{id}/evidence", response_model=EvidenceResponse)
async def add_evidence(
    id: uuid.UUID,
    obj_in: EvidenceCreate,
    db: AsyncSession = Depends(get_db)
):
    return await evidence_service.add_evidence(db, id, obj_in)

@router.post("/{id}/comments", response_model=TimelineEventResponse)
async def add_comment(
    id: uuid.UUID,
    obj_in: TimelineEventCreate,
    db: AsyncSession = Depends(get_db)
):
    from app.models.operations import TimelineEvent
    from app.models.identity import User
    from sqlalchemy import select
    
    # Try to find a default user (System Administrator)
    user_res = await db.execute(select(User).filter(User.name == "System Administrator"))
    user = user_res.scalars().first()
    
    event = TimelineEvent(
        case_id=id,
        user_id=user.id if user else None,
        action_type="comment",
        content=obj_in.content
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    # Reload with relationships
    from sqlalchemy.orm import selectinload
    res = await db.execute(
        select(TimelineEvent)
        .options(selectinload(TimelineEvent.user))
        .filter(TimelineEvent.id == event.id)
    )
    return res.scalars().first()
