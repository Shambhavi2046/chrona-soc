import uuid
from sqlalchemy import Column, String, DateTime, JSON, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
from app.models.mixins import TimestampMixin

class ReportTemplate(Base, TimestampMixin):
    __tablename__ = "report_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    estimated_pages = Column(Integer, default=1)
    category = Column(String, nullable=False) # Executive, Operational, Compliance

class Report(Base, TimestampMixin):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False) # e.g. "Investigation", "Alert", "Threat Hunt"
    source_id = Column(UUID(as_uuid=True), nullable=True) # ID of the alert, investigation, etc.
    template_id = Column(UUID(as_uuid=True), ForeignKey("report_templates.id"), nullable=True)
    generated_by = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Ready") # Ready, Generating, Failed
    pages = Column(Integer, default=1)
    
    # Store the deep JSON content
    content = Column(JSON, nullable=True)
