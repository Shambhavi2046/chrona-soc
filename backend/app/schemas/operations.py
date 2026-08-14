import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.schemas.user import UserResponse

class AlertBase(BaseModel):
    title: str
    severity: str
    threat_type: Optional[str] = None
    risk_score: Optional[int] = 50
    status: Optional[str] = "Open"
    source: Optional[str] = None
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    raw_log: Optional[Dict[str, Any]] = {}
    case_id: Optional[uuid.UUID] = None

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    case_id: Optional[uuid.UUID] = None

class AlertResponse(AlertBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InvestigationBase(BaseModel):
    alert_id: uuid.UUID
    status: Optional[str] = "In Progress"
    summary: Optional[str] = None
    findings: Optional[List[Dict[str, Any]]] = []

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationUpdate(BaseModel):
    status: Optional[str] = None
    summary: Optional[str] = None
    findings: Optional[List[Dict[str, Any]]] = None

class InvestigationDetails(BaseModel):
    analysis: str
    recommendations: List[str]

class InvestigationResponse(BaseModel):
    id: uuid.UUID
    alert_id: uuid.UUID
    threat_type: str
    risk_score: int
    status: str
    investigation: InvestigationDetails
    assignee_id: Optional[uuid.UUID] = None
    
    @model_validator(mode='before')
    @classmethod
    def map_orm(cls, v):
        # If it's a dict (e.g., during tests or creation), don't map ORM fields
        if isinstance(v, dict):
            return v
            
        threat_type = "Unknown"
        risk_score = 50
        if getattr(v, "alert", None):
            threat_type = v.alert.threat_type or "Unknown"
            risk_score = v.alert.risk_score or 50
            
        summary = v.summary or "Investigation initiated."
        
        # Recommendations mapped from findings
        recommendations = []
        if getattr(v, "findings", None):
            for f in v.findings:
                if isinstance(f, dict) and "action" in f:
                    recommendations.append(f["action"])
                elif isinstance(f, str):
                    recommendations.append(f)
                    
        return {
            "id": v.id,
            "alert_id": v.alert_id,
            "threat_type": threat_type,
            "risk_score": risk_score,
            "status": v.status or "In Progress",
            "investigation": {
                "analysis": summary,
                "recommendations": recommendations
            }
        }
        
    model_config = ConfigDict(from_attributes=True)

class CaseBase(BaseModel):
    title: str
    status: Optional[str] = "Open"
    severity: str
    priority: Optional[str] = "Medium"
    risk_score: Optional[int] = 50
    description: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    assignee: Optional[str] = None

from pydantic import field_validator

class CaseResponse(CaseBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    assignee_id: Optional[uuid.UUID] = None
    assignee: Optional[str] = None
    alerts: List[AlertResponse] = []
    timeline: List["TimelineEventResponse"] = Field(default_factory=list, alias="timeline_events")
    evidence: List["EvidenceResponse"] = []
    
    @field_validator("assignee", mode="before")
    @classmethod
    def get_assignee_name(cls, v):
        if hasattr(v, "name"):
            return v.name
        return v
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class EvidenceBase(BaseModel):
    case_id: Optional[uuid.UUID] = None
    evidence_type: str
    value: str
    storage_path: Optional[str] = None

class TimelineEventBase(BaseModel):
    action_type: str = "comment"
    content: str
    case_id: Optional[uuid.UUID] = None

class TimelineEventCreate(TimelineEventBase):
    pass

class TimelineEventResponse(TimelineEventBase):
    id: uuid.UUID
    created_at: datetime
    author: Optional[str] = "System Administrator"
    event_type: str = "comment"

    @model_validator(mode='before')
    @classmethod
    def map_orm(cls, v):
        if isinstance(v, dict):
            return v
        return {
            "id": v.id,
            "created_at": v.created_at,
            "case_id": v.case_id,
            "action_type": v.action_type,
            "content": v.content,
            "author": v.user.name if getattr(v, "user", None) else "System Administrator",
            "event_type": v.action_type
        }

    model_config = ConfigDict(from_attributes=True)

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: uuid.UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
