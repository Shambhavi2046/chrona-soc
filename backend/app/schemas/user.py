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

class RegistrationRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    org_name: str

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

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

class UserSessionResponse(BaseModel):
    id: uuid.UUID
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    is_revoked: bool
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: uuid.UUID
    org_id: uuid.UUID
    created_at: datetime
    
    roles: List[RoleResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
