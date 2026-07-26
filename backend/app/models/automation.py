from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.mixins import UUIDMixin, TimestampMixin

class Playbook(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "playbooks"

    name = Column(String(255), nullable=False, unique=True)
    description = Column(String(500))
    trigger_type = Column(String(100), nullable=False)
    status = Column(String(50), default="Active")
    definition = Column(JSON, default=dict)


