import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = []

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None

class RoleResponse(RoleBase):
    id: uuid.UUID
    created_at: datetime
    is_system: bool
    
    model_config = ConfigDict(from_attributes=True)
