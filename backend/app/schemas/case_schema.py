from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class TimelineEventSchema(BaseModel):
    id: int
    case_id: int
    event_type: str
    content: str
    author: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EvidenceSchema(BaseModel):
    id: int
    case_id: int
    evidence_type: str
    value: str
    description: Optional[str] = None
    added_by: str
    created_at: datetime
    # New inferred dynamic fields
    source: str = "Internal"
    confidence: str = "High"

    model_config = ConfigDict(from_attributes=True)

class CaseSchema(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assignee: Optional[str] = None
    alert_id: Optional[int] = None
    risk_score: int
    created_at: datetime
    updated_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    business_impact: str = "Medium"

    model_config = ConfigDict(from_attributes=True)

class AIRecommendationSchema(BaseModel):
    action: str
    priority: str
    confidence: int
    impact: str
    status: str

class ThreatContextSchema(BaseModel):
    actor: str = "Unknown"
    malware_family: str = "Unknown"
    ioc_count: int = 0
    reputation: str = "Unknown"
    feed_source: str = "Internal Detection"
    cves: List[str] = []

class RiskAssessmentSchema(BaseModel):
    overall_risk: str = "Medium"
    likelihood: str = "Possible"
    asset_exposure: str = "Isolated"
    threat_confidence: str = "Medium"
    attack_complexity: str = "Low"

class CollaborationSchema(BaseModel):
    notes: List[TimelineEventSchema] = []
    decision_log: List[TimelineEventSchema] = []

class CaseDetailSchema(CaseSchema):
    timeline: List[TimelineEventSchema] = []
    evidence: List[EvidenceSchema] = []
    ai_recommendations: List[AIRecommendationSchema] = []
    ai_summary: str = ""
    sla_status: str = "On Track"
    related_cases: List[dict] = []
    affected_assets: List[str] = []
    mitre_tactics: List[str] = []
    linked_alerts: List[dict] = []
    
    threat_context: Optional[ThreatContextSchema] = None
    risk_assessment: Optional[RiskAssessmentSchema] = None
    collaboration: Optional[CollaborationSchema] = None

class CaseUpdateSchema(BaseModel):
    status: Optional[str] = None
    assignee: Optional[str] = None
    priority: Optional[str] = None

class CommentCreateSchema(BaseModel):
    content: str
    event_type: str = "comment" # can be 'note', 'decision'

class EvidenceCreateSchema(BaseModel):
    evidence_type: str
    value: str
    description: Optional[str] = None

