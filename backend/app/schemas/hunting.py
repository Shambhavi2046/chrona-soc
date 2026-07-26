import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class HuntEventSchema(BaseModel):
    id: str
    timestamp: str
    host: str
    source: str
    user: str
    severity: str
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    ioc_match: Optional[str] = None
    description: str
    status: str
    raw_log: str

    model_config = ConfigDict(from_attributes=True)


class SavedHuntBase(BaseModel):
    name: str
    description: Optional[str] = None
    query: str
    mitre_mapping: Optional[str] = None
    author: str

class SavedHuntCreate(SavedHuntBase):
    pass

class SavedHuntUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    query: Optional[str] = None
    mitre_mapping: Optional[str] = None
    last_run: Optional[datetime] = None

class SavedHuntSchema(SavedHuntBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    last_run: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HuntQueryRequest(BaseModel):
    query: Optional[str] = ""
    ioc: Optional[str] = None
    hostname: Optional[str] = None
    username: Optional[str] = None
    severity: Optional[str] = None
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    page: int = 1
    page_size: int = 20
    sort_by: Optional[str] = "timestamp"
    sort_desc: bool = True

class HuntExecuteResponse(BaseModel):
    events: List[HuntEventSchema]
    total: int
    page: int
    page_size: int
