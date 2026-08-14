from typing import Dict, Any, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.identity import AuditLog

async def log_audit(
    db: AsyncSession,
    user_id: uuid.UUID,
    org_id: uuid.UUID,
    action: str,
    resource: str,
    status: str,
    details: Dict[str, Any]
) -> AuditLog:
    """
    Creates an AuditLog record and adds it to the active SQLAlchemy session.

    This function explicitly DOES NOT call db.commit() to ensure that the audit
    record participates in the same atomic transaction as the parent operation.
    """
    audit_record = AuditLog(
        user_id=user_id,
        org_id=org_id,
        action=action,
        resource=resource,
        status=status,
        details=details
    )
    db.add(audit_record)
    return audit_record
