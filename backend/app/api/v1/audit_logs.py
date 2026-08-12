from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select
from app.db.session import get_db
from app.models.identity import AuditLog
from app.middleware.auth import require_permissions
from app.utils.validation import get_pagination, PaginationParams

router = APIRouter()

@router.get("")
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    current_user = Depends(require_permissions(["users:read"]))
):
    result = await db.execute(
        select(AuditLog).filter(AuditLog.org_id == current_user.org_id).offset(pagination.skip).limit(pagination.limit)
    )
    return result.scalars().all()
