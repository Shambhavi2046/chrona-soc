from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any
from datetime import datetime
import uuid

class IOCBase(BaseModel):
    type: str
    value: str
    confidence: int = Field(default=50, ge=0, le=100)
    source: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    status: str = "Active"
    category: Optional[str] = None

class IOCResponse(IOCBase):
    id: uuid.UUID
    org_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ThreatStatsResponse(BaseModel):
    activeThreats: int
    criticalIndicators: int
    blockedIocs: int
    threatScore: int

class ThreatFeedCreate(BaseModel):
    name: str
    url: str

class ThreatFeedResponse(BaseModel):
    id: uuid.UUID
    org_id: Optional[uuid.UUID] = None
    name: str
    url: str
    status: str
    last_sync: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

