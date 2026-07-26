from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from app.db.base_class import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    # Core Identifiers
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    event_id = Column(String, unique=True, index=True, nullable=False) # For idempotency
    
    # Temporal & Sourcing
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    source = Column(String, index=True, nullable=False) # e.g. "windows_event_log", "crowdstrike"
    vendor = Column(String, nullable=True)
    product = Column(String, nullable=True)
    
    # Normalized Entities
    hostname = Column(String, index=True, nullable=True)
    asset = Column(String, index=True, nullable=True)
    user_account = Column(String, index=True, nullable=True) # Changed from 'user' which is reserved in postgres
    ip_address = Column(String, index=True, nullable=True)
    destination_ip = Column(String, index=True, nullable=True)
    
    # Process Context
    process_name = Column(String, nullable=True)
    command_line = Column(String, nullable=True)
    
    # Categorization
    event_type = Column(String, index=True, nullable=False) # e.g. "logon", "process_creation"
    severity = Column(String, index=True, nullable=False) # e.g. "info", "low", "medium", "high", "critical"
    status = Column(String, index=True, nullable=True) # e.g. "success", "failure", "blocked"
    
    # Raw & Extensible Data
    raw_event = Column(JSON, nullable=False)
    normalized_data = Column(JSON, nullable=True)
    
    # Analytics
    mitre_techniques = Column(JSON, nullable=True) # List of strings e.g. ["T1078", "T1059"]
    tags = Column(JSON, nullable=True) # List of strings
