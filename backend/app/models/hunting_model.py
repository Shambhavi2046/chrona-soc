import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
from app.models.mixins import TimestampMixin

class SavedHunt(Base, TimestampMixin):
    __tablename__ = "saved_hunts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    query = Column(String, nullable=False)
    mitre_mapping = Column(String, nullable=True)
    author = Column(String, nullable=False)
    last_run = Column(DateTime, nullable=True)
