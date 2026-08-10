from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.db.session import get_db
from app.services.soar_service import soar_service
from app.services.credentials_service import credentials_service
from app.schemas.soar import PlaybookCreate, PlaybookUpdate, PlaybookResponse, PlaybookExecutionResponse
from app.schemas.credentials import CredentialCreate, CredentialResponse
from app.middleware.auth import require_permissions
from app.models.identity import User

router = APIRouter()

@router.get("/credentials", response_model=List[CredentialResponse])
async def list_credentials(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:read"]))
):
    return await credentials_service.get_all(db, org_id=current_user.org_id)

@router.post("/credentials", response_model=CredentialResponse)
async def create_credential(
    obj_in: CredentialCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:write"]))
):
    return await credentials_service.create(db, obj_in, org_id=current_user.org_id)

@router.delete("/credentials/{id}")
async def delete_credential(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:delete"]))
):
    success = await credentials_service.delete(db, id, org_id=current_user.org_id)
    if not success:
        raise HTTPException(status_code=404, detail="Credential not found")
    return {"status": "success"}

@router.get("/playbooks", response_model=List[PlaybookResponse])
async def list_playbooks(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:read"]))
):
    return await soar_service.get_all(db, skip=skip, limit=limit, org_id=current_user.org_id)

@router.get("/playbooks/{id}", response_model=PlaybookResponse)
async def get_playbook(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:read"]))
):
    playbook = await soar_service.get_by_id(db, id, org_id=current_user.org_id)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return playbook

@router.post("/playbooks", response_model=PlaybookResponse)
async def create_playbook(
    obj_in: PlaybookCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:write"]))
):
    return await soar_service.create(db, obj_in, org_id=current_user.org_id)

@router.put("/playbooks/{id}", response_model=PlaybookResponse)
async def update_playbook(
    id: uuid.UUID, 
    obj_in: PlaybookUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:write"]))
):
    return await soar_service.update(db, id, obj_in, org_id=current_user.org_id)

@router.delete("/playbooks/{id}")
async def delete_playbook(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:delete"]))
):
    await soar_service.delete(db, id, org_id=current_user.org_id)
    return {"status": "success"}

@router.patch("/playbooks/{id}/activate", response_model=PlaybookResponse)
async def activate_playbook(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:write"]))
):
    return await soar_service.activate(db, id, org_id=current_user.org_id)

@router.patch("/playbooks/{id}/deactivate", response_model=PlaybookResponse)
async def deactivate_playbook(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:write"]))
):
    return await soar_service.deactivate(db, id, org_id=current_user.org_id)

@router.post("/playbooks/{id}/execute", response_model=PlaybookExecutionResponse)
async def execute_playbook(
    id: uuid.UUID, 
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:execute"]))
):
    return await soar_service.execute_playbook(db, id, background_tasks, user=current_user.email, org_id=current_user.org_id)

@router.get("/executions", response_model=List[PlaybookExecutionResponse])
async def list_executions(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:read"]))
):
    return await soar_service.get_executions(db, skip=skip, limit=limit, org_id=current_user.org_id)

@router.get("/executions/{id}", response_model=PlaybookExecutionResponse)
async def get_execution(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:read"]))
):
    return await soar_service.get_execution_by_id(db, id, org_id=current_user.org_id)

@router.post("/executions/{id}/cancel", response_model=PlaybookExecutionResponse)
async def cancel_execution(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:execute"]))
):
    return await soar_service.cancel_execution(db, id, org_id=current_user.org_id)

@router.post("/executions/{id}/pause", response_model=PlaybookExecutionResponse)
async def pause_execution(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:execute"]))
):
    return await soar_service.pause_execution(db, id, org_id=current_user.org_id)

@router.post("/executions/{id}/resume", response_model=PlaybookExecutionResponse)
async def resume_execution(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["soar:execute"]))
):
    return await soar_service.resume_execution(db, id, org_id=current_user.org_id)
