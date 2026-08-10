from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.mixins import UUIDMixin, TimestampMixin

class Playbook(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "playbooks"

    org_id = Column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(String(500))
    category = Column(String(100), default="General")
    trigger_type = Column(String(100), nullable=False)
    status = Column(String(50), default="Active")
    definition = Column(JSON, default=dict)
    created_by = Column(String(255), default="System")

    executions = relationship("PlaybookExecution", back_populates="playbook", cascade="all, delete-orphan")


class PlaybookExecution(Base, UUIDMixin):
    __tablename__ = "playbook_executions"

    playbook_id = Column(ForeignKey("playbooks.id"), nullable=False)
    status = Column(String(50), default="Running")
    started_at = Column(String(100), nullable=False)
    completed_at = Column(String(100), nullable=True)
    duration = Column(String(50), nullable=True)
    execution_logs = Column(JSON, default=list)
    initiated_by = Column(String(255), default="System")

    playbook = relationship("Playbook", back_populates="executions")
