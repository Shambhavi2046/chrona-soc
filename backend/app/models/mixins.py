import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_mixin

@declarative_mixin
class UUIDMixin:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

@declarative_mixin
class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

@declarative_mixin
class SoftDeleteMixin:
    is_deleted = Column(Boolean, default=False, nullable=False)
