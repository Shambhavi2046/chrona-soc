from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.services.hunting_service import hunting_service
from app.middleware.auth import get_current_user
from app.models.identity import User
from app.schemas.hunting import SavedHuntCreate, SavedHuntUpdate, SavedHuntSchema, HuntQueryRequest, HuntExecuteResponse
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("/saved", response_model=List[SavedHuntSchema])
async def list_saved_hunts(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination)
):
    return await hunting_service.repository.get_all(db, skip=pagination.skip, limit=pagination.limit)

@router.post("/saved", response_model=SavedHuntSchema)
async def create_saved_hunt(
    obj_in: SavedHuntCreate,
    db: AsyncSession = Depends(get_db)
):
    return await hunting_service.create_saved_hunt(db, obj_in)

@router.delete("/saved/{id}")
async def delete_saved_hunt(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    await hunting_service.delete_saved_hunt(db, id)
    return {"status": "success"}

@router.patch("/saved/{id}", response_model=SavedHuntSchema)
async def update_saved_hunt(
    id: uuid.UUID,
    obj_in: SavedHuntUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await hunting_service.update_saved_hunt(db, id, obj_in)

@router.post("/execute", response_model=HuntExecuteResponse)
async def execute_hunt(
    request: HuntQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await hunting_service.execute_hunt(db, request, current_user.org_id)

@router.post("/copilot/{event_id}")
async def ask_copilot(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await hunting_service.ask_copilot(db, event_id, current_user.org_id)
