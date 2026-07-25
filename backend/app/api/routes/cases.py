from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import SessionLocal
from app.schemas.case_schema import (
    CaseSchema, CaseDetailSchema, CaseUpdateSchema, 
    CommentCreateSchema, EvidenceCreateSchema, TimelineEventSchema, EvidenceSchema
)
from app.services import case_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/cases", response_model=List[CaseSchema])
def get_all_cases(db: Session = Depends(get_db)):
    return case_service.get_cases(db)

@router.get("/cases/{case_id}", response_model=CaseDetailSchema)
def get_case_detail(case_id: int, db: Session = Depends(get_db)):
    case = case_service.get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    summary, recs = case_service.generate_ai_summary(case)
    
    # Calculate SLA status (mock logic for enterprise feel)
    sla = "On Track"
    if case.status == "New" and (datetime.utcnow() - case.created_at).total_seconds() > 3600:
        sla = "Breached"
    
    response = CaseDetailSchema.model_validate(case)
    response.ai_summary = summary
    response.ai_recommendations = recs
    response.sla_status = sla
    
    # Mock populated data for enterprise enhancements
    response.related_cases = [
        {"id": 102, "title": "Suspicious Login Activity", "status": "Closed"},
        {"id": 105, "title": "Lateral Movement Attempt", "status": "Open"}
    ]
    response.affected_assets = ["DB-Cluster-01", "Web-Server-EU"]
    response.mitre_tactics = ["T1110 Credential Access", "T1078 Valid Accounts"]
    response.linked_alerts = [
        {"id": case.alert_id, "threat_type": "Primary Detection", "risk_score": case.risk_score}
    ]
    
    # Dynamic Risk Assessment
    overall = "High" if case.risk_score > 75 else "Medium" if case.risk_score > 40 else "Low"
    response.risk_assessment = {
        "overall_risk": overall,
        "likelihood": "High" if case.risk_score > 60 else "Possible",
        "asset_exposure": "Critical" if "Exfiltration" in case.title else "Isolated",
        "threat_confidence": "High" if len(case.evidence) > 0 else "Medium",
        "attack_complexity": "Medium"
    }
    
    # Dynamic Threat Context
    actor = "Unknown"
    malware = "Unknown"
    cves = []
    if "Brute Force" in case.title:
        actor = "APT-29"
        cves = ["CVE-2023-1234"]
    elif "Exfiltration" in case.title or "Ransomware" in case.title:
        actor = "LockBit Group"
        malware = "LockBit 3.0"
        cves = ["CVE-2021-34527"]
        
    response.threat_context = {
        "actor": actor,
        "malware_family": malware,
        "ioc_count": len(case.evidence),
        "reputation": "Malicious" if case.risk_score > 80 else "Suspicious",
        "feed_source": "Chrona Threat Intel",
        "cves": cves
    }
    
    # Enhance Evidence with Context
    for ev in response.evidence:
        if ev.evidence_type.lower() == "ip":
            ev.confidence = "High"
            ev.source = "Perimeter Firewall"
        elif ev.evidence_type.lower() == "hash":
            ev.confidence = "Critical"
            ev.source = "Endpoint EDR"
        elif ev.evidence_type.lower() in ["domain", "url"]:
            ev.confidence = "High"
            ev.source = "DNS Logs"
        else:
            ev.confidence = "Medium"
            ev.source = "SIEM Log"
            
    # Parse Collaboration data
    notes = [e for e in case.timeline if e.event_type in ["note", "comment"]]
    decisions = [e for e in case.timeline if e.event_type == "decision"]
    
    response.collaboration = {
        "notes": [TimelineEventSchema.model_validate(n) for n in notes],
        "decision_log": [TimelineEventSchema.model_validate(d) for d in decisions]
    }
    
    return response

@router.patch("/cases/{case_id}", response_model=CaseSchema)
def update_case(case_id: int, update: CaseUpdateSchema, db: Session = Depends(get_db)):
    case = case_service.update_case(db, case_id, update)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/cases/{case_id}/comments", response_model=TimelineEventSchema)
def add_case_comment(case_id: int, comment: CommentCreateSchema, db: Session = Depends(get_db)):
    case = case_service.get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case_service.add_comment(db, case_id, comment)

@router.post("/cases/{case_id}/evidence", response_model=EvidenceSchema)
def add_case_evidence(case_id: int, evidence: EvidenceCreateSchema, db: Session = Depends(get_db)):
    case = case_service.get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case_service.add_evidence(db, case_id, evidence)

from datetime import datetime
