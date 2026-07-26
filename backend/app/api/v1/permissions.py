from fastapi import APIRouter, Depends
from typing import List
from app.core.roles import Permission
from app.middleware.auth import require_permissions

router = APIRouter()

@router.get("", response_model=List[str])
async def list_permissions(
    _=Depends(require_permissions(["roles:read"]))
):
    return [p.value for p in Permission]
