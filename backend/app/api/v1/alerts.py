from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid
from app.db.session import get_db
from app.services.operations import alert_service
from app.schemas.operations import AlertCreate, AlertUpdate, AlertResponse
from app.middleware.auth import require_permissions
from app.models.identity import User
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    current_user: User = Depends(require_permissions(["alerts:read"]))
):
    return await alert_service.repository.get_all_paginated(
        db, skip=pagination.skip, limit=pagination.limit, status=status, severity=severity, org_id=current_user.org_id
    )

@router.post("", response_model=AlertResponse)
async def create_alert(
    obj_in: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["alerts:write"]))
):
    return await alert_service.create_alert(db, obj_in, org_id=current_user.org_id)

@router.get("/{id}", response_model=AlertResponse)
async def get_alert(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["alerts:read"]))
):
    alert = await alert_service.get_by_id(db, id, org_id=current_user.org_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{id}", response_model=AlertResponse)
async def update_alert(
    id: uuid.UUID,
    obj_in: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["alerts:write"]))
):
    return await alert_service.update_alert(db, id, obj_in, org_id=current_user.org_id)

@router.delete("/{id}", status_code=204)
async def delete_alert(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["alerts:delete"]))
):
    await alert_service.delete_alert(db, id, org_id=current_user.org_id)
    return None
