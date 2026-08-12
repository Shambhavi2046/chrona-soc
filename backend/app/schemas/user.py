import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.schemas.organization import OrganizationResponse
from app.schemas.role import RoleResponse

class UserBase(BaseModel):
    email: str
    name: str
    status: Optional[str] = "Active"
    mfa_enabled: Optional[bool] = False

class UserCreate(UserBase):
    password: str = Field(min_length=8)
    role_ids: List[uuid.UUID] = []

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    status: Optional[str] = None
    mfa_enabled: Optional[bool] = None
    role_ids: Optional[List[uuid.UUID]] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    
    model_config = ConfigDict(extra="forbid")

class UserResponse(UserBase):
    id: uuid.UUID
    org_id: uuid.UUID
    created_at: datetime
    
    roles: List[RoleResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
