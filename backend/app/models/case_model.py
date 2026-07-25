from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="New", nullable=False) # New, Open, Assigned, Investigating, Containment, Recovery, Resolved, Closed
    priority = Column(String, default="Medium", nullable=False)
    assignee = Column(String, nullable=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    risk_score = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    alert = relationship("Alert", backref="case")
    timeline = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    event_type = Column(String, nullable=False) # status_change, comment, assignment, evidence_added, ai_summary
    content = Column(Text, nullable=False)
    author = Column(String, default="System")
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="timeline")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    evidence_type = Column(String, nullable=False) # IP, Domain, Hash, Note, File
    value = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    added_by = Column(String, default="System")
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="evidence")
