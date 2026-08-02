from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class PlaybookBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field("General", max_length=100)
    trigger_type: str = Field(..., max_length=100)
    status: Optional[str] = Field("Active", max_length=50)
    workflow_definition: Optional[Dict[str, Any]] = Field(default_factory=dict, alias="definition")
    
    model_config = ConfigDict(populate_by_name=True)


class PlaybookCreate(PlaybookBase):
    pass


class PlaybookUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    trigger_type: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    workflow_definition: Optional[Dict[str, Any]] = Field(None, alias="definition")
    
    model_config = ConfigDict(populate_by_name=True)


class PlaybookResponse(PlaybookBase):
    id: uuid.UUID
    created_by: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PlaybookExecutionResponse(BaseModel):
    id: uuid.UUID
    playbook_id: uuid.UUID
    status: str
    started_at: str
    completed_at: Optional[str]
    duration: Optional[str]
    execution_logs: Any
    initiated_by: str

    playbookName: str = Field(alias="playbookName", default="")
    trigger: str = Field(alias="trigger", default="")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
