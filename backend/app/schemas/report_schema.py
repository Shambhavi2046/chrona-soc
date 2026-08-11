from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

# The inner JSON content schema based on the requirements
class ReportContentSchema(BaseModel):
    executive_summary: str = ""
    incident_overview: str = ""
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    affected_assets: List[str] = Field(default_factory=list)
    mitre_mapping: List[str] = Field(default_factory=list)
    indicators_of_compromise: List[Dict[str, Any]] = Field(default_factory=list)
    analyst_findings: str = ""
    recommendations: str = ""
    appendix: str = ""

class ReportTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    estimated_pages: int = 1
    category: str

class ReportTemplateSchema(ReportTemplateBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    name: str
    type: str
    source_id: Optional[str] = None
    template_id: Optional[uuid.UUID] = None
    generated_by: str
    status: str = "Ready"
    pages: int = 1
    content: Optional[ReportContentSchema] = None

class ReportCreate(ReportBase):
    pass

class ReportSchema(ReportBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportGenerateRequest(BaseModel):
    name: str
    source_type: str # 'Alert', 'Investigation', 'Threat Hunt'
    source_id: str
    template_id: Optional[uuid.UUID] = None
    generated_by: str = "System"
