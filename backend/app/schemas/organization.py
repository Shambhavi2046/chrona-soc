import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class OrganizationBase(BaseModel):
    name: str
    plan: Optional[str] = "Standard"
    status: Optional[str] = "Active"

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None

class OrganizationResponse(OrganizationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
