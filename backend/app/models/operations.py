from sqlalchemy import Column, String, ForeignKey, JSON, Integer, Text, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.mixins import UUIDMixin, TimestampMixin, SoftDeleteMixin

class Alert(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "alerts"

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    threat_type = Column(String(100))
    risk_score = Column(Integer, default=50)
    severity = Column(String(50), nullable=False, index=True)
    confidence = Column(Integer, default=50)
    status = Column(String(50), default="Open", index=True)
    source = Column(String(100))
    source_rule = Column(String(100), nullable=True)
    mitre_tactic = Column(String(100))
    mitre_technique = Column(String(100))
    mitre_mapping = Column(JSON, default=list) # Detailed mapping
    raw_log = Column(JSON, default=dict)
    related_events = Column(JSON, default=list) # List of event IDs
    
    case_id = Column(ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    case = relationship("Case", back_populates="alerts")
    
    investigation = relationship("Investigation", back_populates="alert", uselist=False, cascade="all, delete-orphan")

class Investigation(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "investigations"

    alert_id = Column(ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False, unique=True)
    status = Column(String(50), default="In Progress", index=True)
    summary = Column(Text)
    findings = Column(JSON, default=list)
    
    assignee_id = Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assignee = relationship("User", foreign_keys=[assignee_id])
    
    alert = relationship("Alert", back_populates="investigation")

class Case(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "cases"

    title = Column(String(255), nullable=False)
    status = Column(String(50), default="Open", index=True)
    severity = Column(String(50), nullable=False)
    priority = Column(String(50), default="Medium")
    risk_score = Column(Integer, default=50)
    description = Column(Text)
    
    assignee_id = Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assignee = relationship("User", foreign_keys=[assignee_id])
    
    alerts = relationship("Alert", back_populates="case")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")

class TimelineEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "timeline_events"

    case_id = Column(ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action_type = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)

    case = relationship("Case", back_populates="timeline_events")
    user = relationship("User", foreign_keys=[user_id])

class Evidence(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "evidence"

    case_id = Column(ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    evidence_type = Column(String(100), nullable=False)
    value = Column(Text, nullable=False)
    storage_path = Column(String(500))

    case = relationship("Case", back_populates="evidence")

class IOC(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "iocs"

    type = Column(String(50), nullable=False, index=True)
    value = Column(String(255), nullable=False, unique=True, index=True)
    confidence = Column(Integer, default=50)
    source = Column(String(255))
    tags = Column(JSON, default=list)

class ThreatFeed(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "threat_feeds"

    name = Column(String(255), nullable=False, unique=True)
    url = Column(String(500), nullable=False)
    status = Column(String(50), default="Active")
    last_sync = Column(DateTime, nullable=True)
