from sqlalchemy.orm import Session
from datetime import datetime
from app.models.case_model import Case, TimelineEvent, Evidence
from app.models.alert_model import Alert
from app.schemas.case_schema import CaseUpdateSchema, CommentCreateSchema, EvidenceCreateSchema

def initialize_cases(db: Session):
    """Auto-converts existing Alerts into Cases if they don't have one."""
    alerts = db.query(Alert).all()
    for alert in alerts:
        existing_case = db.query(Case).filter(Case.alert_id == alert.id).first()
        if not existing_case:
            new_case = Case(
                title=f"Investigation: {alert.threat_type}",
                description=f"Auto-generated case for alert ID {alert.id}",
                status="New" if alert.status == "open" else "Closed",
                priority="High" if alert.risk_score >= 80 else "Medium",
                alert_id=alert.id,
                risk_score=alert.risk_score,
                assignee=None
            )
            db.add(new_case)
            db.commit()
            db.refresh(new_case)
            
            # Create initial timeline event
            event = TimelineEvent(
                case_id=new_case.id,
                event_type="status_change",
                content="Case automatically created from Alert",
                author="System"
            )
            db.add(event)
            db.commit()

def get_cases(db: Session):
    initialize_cases(db)
    return db.query(Case).order_by(Case.created_at.desc()).all()

def get_case(db: Session, case_id: int):
    case = db.query(Case).filter(Case.id == case_id).first()
    return case

def update_case(db: Session, case_id: int, update_data: CaseUpdateSchema, username: str = "Analyst"):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return None

    changes = []
    if update_data.status and update_data.status != case.status:
        changes.append(f"Status changed from {case.status} to {update_data.status}")
        case.status = update_data.status
        if update_data.status in ["Resolved", "Closed"]:
            case.resolved_at = datetime.utcnow()
    
    if update_data.assignee and update_data.assignee != case.assignee:
        changes.append(f"Assigned to {update_data.assignee}")
        case.assignee = update_data.assignee
        if not case.acknowledged_at:
            case.acknowledged_at = datetime.utcnow()

    if update_data.priority and update_data.priority != case.priority:
        changes.append(f"Priority changed from {case.priority} to {update_data.priority}")
        case.priority = update_data.priority

    if changes:
        case.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(case)
        
        # Log timeline event
        event = TimelineEvent(
            case_id=case.id,
            event_type="status_change",
            content="; ".join(changes),
            author=username
        )
        db.add(event)
        db.commit()

    return case

def add_comment(db: Session, case_id: int, comment: CommentCreateSchema, username: str = "Analyst"):
    event = TimelineEvent(
        case_id=case_id,
        event_type=comment.event_type,
        content=comment.content,
        author=username
    )
    db.add(event)
    
    # Update case timestamp
    case = db.query(Case).filter(Case.id == case_id).first()
    if case:
        case.updated_at = datetime.utcnow()
        
    db.commit()
    db.refresh(event)
    return event

def add_evidence(db: Session, case_id: int, evidence: EvidenceCreateSchema, username: str = "Analyst"):
    ev = Evidence(
        case_id=case_id,
        evidence_type=evidence.evidence_type,
        value=evidence.value,
        description=evidence.description,
        added_by=username
    )
    db.add(ev)
    
    # Log timeline event
    event = TimelineEvent(
        case_id=case_id,
        event_type="evidence_added",
        content=f"Added {evidence.evidence_type} evidence: {evidence.value}",
        author=username
    )
    db.add(event)
    
    case = db.query(Case).filter(Case.id == case_id).first()
    if case:
        case.updated_at = datetime.utcnow()
        
    db.commit()
    db.refresh(ev)
    return ev

def generate_ai_summary(case: Case):
    """Generates dynamic context-aware AI summary and recommendations based on case data."""
    if not case:
        return "", []
        
    # Generate Context-Aware Summary
    summary = f"SOC analytics indicate a {case.priority} priority threat: {case.title}. "
    if case.risk_score >= 80:
        summary += "Critical asset exposure detected with potential for lateral movement. Immediate containment recommended. "
    else:
        summary += "Activity mapped to known IOCs. Monitor for anomalous escalation. "
        
    summary += f"Current status is {case.status} with a risk score of {case.risk_score}/100."
    
    # Generate structured executable recommendations
    recommendations = []
    if "Brute Force" in case.title or "Login" in case.title:
        recommendations = [
            {"action": "Reset compromised user credentials", "priority": "High", "confidence": 95, "impact": "User Lockout", "status": "Pending"},
            {"action": "Enforce MFA on all accounts", "priority": "Medium", "confidence": 100, "impact": "Global Config", "status": "Pending"},
            {"action": "Block source IP address", "priority": "High", "confidence": 88, "impact": "Network Segment", "status": "Pending"}
        ]
    elif "Exfiltration" in case.title or "Data" in case.title:
        recommendations = [
            {"action": "Isolate affected endpoint from network", "priority": "Critical", "confidence": 92, "impact": "Downtime", "status": "Pending"},
            {"action": "Review recent file access logs", "priority": "Medium", "confidence": 100, "impact": "Investigation", "status": "Pending"},
            {"action": "Block destination domain", "priority": "High", "confidence": 85, "impact": "Network Routing", "status": "Pending"}
        ]
    else:
        recommendations = [
            {"action": "Investigate affected assets", "priority": "High", "confidence": 90, "impact": "Investigation", "status": "Pending"},
            {"action": "Review associated network traffic", "priority": "Medium", "confidence": 100, "impact": "Investigation", "status": "Pending"},
            {"action": "Update firewall rules", "priority": "Medium", "confidence": 75, "impact": "Network Routing", "status": "Pending"}
        ]
        
    return summary, recommendations
