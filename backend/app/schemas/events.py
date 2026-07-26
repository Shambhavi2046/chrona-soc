from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

class EventCreate(BaseModel):
    event_id: str = Field(..., description="Unique ID from the source system for idempotency")
    timestamp: datetime
    source: str = Field(..., description="E.g., windows_event_log, crowdstrike, sysmon")
    vendor: Optional[str] = None
    product: Optional[str] = None
    
    hostname: Optional[str] = None
    asset: Optional[str] = None
    user_account: Optional[str] = None
    ip_address: Optional[str] = None
    destination_ip: Optional[str] = None
    
    process_name: Optional[str] = None
    command_line: Optional[str] = None
    
    event_type: str
    severity: str = Field(..., description="info, low, medium, high, critical")
    status: Optional[str] = None
    
    raw_event: Dict[str, Any]
    normalized_data: Optional[Dict[str, Any]] = None
    mitre_techniques: Optional[List[str]] = None
    tags: Optional[List[str]] = None

class EventResponse(EventCreate):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class EventSearch(BaseModel):
    skip: int = 0
    limit: int = 100
    severity: Optional[str] = None
    source: Optional[str] = None
    hostname: Optional[str] = None
    user_account: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
