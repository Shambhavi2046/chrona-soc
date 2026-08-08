from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class CredentialBase(BaseModel):
    name: str
    provider: str

class CredentialCreate(CredentialBase):
    secret: str

class CredentialResponse(CredentialBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
