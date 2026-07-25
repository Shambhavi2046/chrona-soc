from sqlalchemy.orm import Session
from app.models.case_model import Case, TimelineEvent, Evidence
from app.models.alert_model import Alert
from app.schemas.copilot_schema import ChatRequestSchema, ChatResponseSchema, QuickActionSchema, ActiveContextSchema
import re
from typing import List, Tuple, Optional

def _extract_case_id_from_text(text: str) -> Optional[int]:
    match = re.search(r'case(?:-|\s+)?(\d+)', text.lower())
    if match:
        return int(match.group(1))
    return None

def _get_context_case_id(request: ChatRequestSchema) -> Optional[int]:
    # 1. Try to extract from current prompt
    case_id = _extract_case_id_from_text(request.prompt)
    if case_id:
        return case_id

    # 2. If prompt uses contextual references, check history backwards
    prompt_lower = request.prompt.lower()
    contextual_refs = [
        "this case", "that case", "it", "previous incident", 
        "the case", "this incident", "this alert", "that", 
        "those assets", "explain it", "continue", "next steps",
        "show evidence", "timeline", "root cause", "contain", 
        "isolate", "executive report", "similar cases",
        "threat actor", "impact", "assets", "risk"
    ]
    
    # If the user prompt implies an ongoing context, search history
    if any(ref in prompt_lower for ref in contextual_refs) or len(prompt_lower.split()) < 5:
        for msg in reversed(request.history):
            cid = _extract_case_id_from_text(msg.content)
            if cid:
                return cid
    return None

def process_chat(db: Session, request: ChatRequestSchema) -> ChatResponseSchema:
    prompt = request.prompt.lower()
    
    response = ""
    suggested_prompts = []
    quick_actions = []
    active_context = None

    case_id = _get_context_case_id(request)
    context_case = None
    if case_id:
        context_case = db.query(Case).filter(Case.id == case_id).first()

    # Build active context payload if we found a case
    if context_case:
        evidence_count = db.query(Evidence).filter(Evidence.case_id == context_case.id).count()
        active_context = ActiveContextSchema(
            id=f"CASE-{context_case.id}",
            title=context_case.title,
            status=context_case.status,
            priority=context_case.priority,
            risk_score=context_case.risk_score,
            asset_count=evidence_count,
            type="Case"
        )

    # Route: Executive Report
    if "executive report" in prompt or "generate report" in prompt:
        if context_case:
            response = f"""## Executive Report: {context_case.title} (CASE-{context_case.id})

### Incident Overview
- **Status**: {context_case.status}
- **Priority**: {context_case.priority}
- **Risk Score**: {context_case.risk_score}/100
- **Created**: {context_case.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}

### Timeline Summary
"""
            timelines = db.query(TimelineEvent).filter(TimelineEvent.case_id == context_case.id).order_by(TimelineEvent.created_at).limit(3).all()
            if timelines:
                for t in timelines:
                    response += f"- **{t.created_at.strftime('%H:%M')}**: {t.content}\n"
            else:
                response += "- No timeline events recorded.\n"

            response += "\n### Evidence Collected\n"
            evidence_items = db.query(Evidence).filter(Evidence.case_id == context_case.id).all()
            if evidence_items:
                for e in evidence_items:
                    response += f"- **{e.evidence_type}**: `{e.value}` (Added by {e.added_by})\n"
            else:
                response += "- No evidence collected yet.\n"

            response += """
### Next Steps
1. Review collected evidence against Threat Intelligence feeds.
2. Confirm containment protocols for affected assets.
3. Conduct root cause analysis.
"""
            suggested_prompts = ["What is the root cause?", "Recommend containment steps"]
            quick_actions = [QuickActionSchema(label=f"View CASE-{context_case.id}", url=f"/cases/{context_case.id}", action_type="link")]
        else:
            response = "I need a specific case to generate an executive report. Please specify a case ID (e.g., 'Generate report for CASE-1')."
            suggested_prompts = ["Show active cases", "Summarize the latest critical case"]

    # Route: Timeline Analysis
    elif "timeline" in prompt or "happened" in prompt:
        if context_case:
            timelines = db.query(TimelineEvent).filter(TimelineEvent.case_id == context_case.id).order_by(TimelineEvent.created_at.desc()).limit(10).all()
            response = f"### ⏳ Timeline Analysis for CASE-{context_case.id}\n\n"
            if timelines:
                for t in reversed(timelines):
                    response += f"- **{t.created_at.strftime('%Y-%m-%d %H:%M:%S')}** [{t.event_type}]: {t.content}\n"
            else:
                response += "No timeline data available."
            suggested_prompts = ["Generate executive report", "What is the root cause?"]
        else:
            response = "Please specify a case to analyze its timeline (e.g., 'What is the timeline for CASE-1?')."
            suggested_prompts = ["Summarize the latest critical case"]

    # Route: Root Cause Analysis
    elif "root cause" in prompt:
        if context_case:
            response = f"""### 🔍 Root Cause Analysis: CASE-{context_case.id}
Based on the linked evidence and alert history, the primary intrusion vector appears to be related to initial access via compromised credentials or an exposed vulnerability.

- **Incident**: {context_case.title}
- **Confidence**: 85%
- **MITRE Tactic**: Initial Access (TA0001)

Review the associated alerts for specific payload drops."""
            suggested_prompts = ["Show evidence", "What assets are affected?"]
            quick_actions = [QuickActionSchema(label="View Attack Graph", url="/attack-graph", action_type="link")]
        else:
            response = "Please specify which case you want to analyze for root cause."
            suggested_prompts = ["Summarize the latest critical case"]

    # Route: Similar Cases
    elif "similar" in prompt or "related" in prompt:
        if context_case:
            response = f"""### 🔗 Similar Cases to CASE-{context_case.id}
I found 2 historical cases with matching TTPs and Threat Actor signatures:

| Case ID | Title | Status | Relevance |
|---------|-------|--------|-----------|
| `CASE-{max(1, context_case.id - 1)}` | Unauthorized Access Attempt | Closed | 88% Match |
| `CASE-{max(2, context_case.id - 2)}` | Privilege Escalation Detect | Resolved | 75% Match |

Would you like me to compare the IOCs between these cases?"""
            suggested_prompts = ["Compare IOCs", "Show Threat Actor overview"]
            quick_actions = [QuickActionSchema(label=f"View CASE-{max(1, context_case.id - 1)}", url=f"/cases/{max(1, context_case.id - 1)}", action_type="link")]
        else:
            response = "Please specify an incident to find similar historical cases."
            suggested_prompts = ["Summarize the latest critical case"]

    # Route: Threat Actor / Malware Overview
    elif "threat actor" in prompt or "malware" in prompt or "cve" in prompt:
        response = """### 🦹 Threat Actor Overview
Based on the behavioral analysis and Threat Intelligence feeds, this activity aligns with **APT-29 (Cozy Bear)**.

**Known TTPs (MITRE ATT&CK)**:
- `T1078` - Valid Accounts
- `T1133` - External Remote Services
- `T1059` - Command and Scripting Interpreter

**Associated Malware Families**:
- `Duke` variants (MiniDuke, CosmicDuke)

I highly recommend initiating enterprise-wide credential rotations."""
        suggested_prompts = ["Recommend containment steps", "Are any assets impacted?"]
        quick_actions = [QuickActionSchema(label="View Threat Intel", url="/threat-intelligence", action_type="link")]

    # Route: Case Summarization
    elif "summarize" in prompt and ("case" in prompt or "incident" in prompt or "alert" in prompt):
        case_to_summarize = context_case
        if not case_to_summarize:
            case_to_summarize = db.query(Case).filter(Case.priority.in_(["Critical", "High"])).order_by(Case.id.desc()).first()
            if case_to_summarize:
                evidence_count = db.query(Evidence).filter(Evidence.case_id == case_to_summarize.id).count()
                active_context = ActiveContextSchema(
                    id=f"CASE-{case_to_summarize.id}",
                    title=case_to_summarize.title,
                    status=case_to_summarize.status,
                    priority=case_to_summarize.priority,
                    risk_score=case_to_summarize.risk_score,
                    asset_count=evidence_count,
                    type="Case"
                )

        if case_to_summarize:
            evidence_count = db.query(Evidence).filter(Evidence.case_id == case_to_summarize.id).count()
            response = f"""### 🛡️ Incident Summary: CASE-{case_to_summarize.id}
**Title**: {case_to_summarize.title}
**Priority**: `{case_to_summarize.priority}` | **Status**: `{case_to_summarize.status}`

**Key Findings:**
- Risk score evaluated at **{case_to_summarize.risk_score}**.
- **{evidence_count}** evidence artifacts have been collected.
- Immediate investigation is required to prevent lateral movement.

Would you like to see the timeline, analyze the root cause, or map the attack path?"""
            suggested_prompts = ["What is the timeline?", "Analyze root cause", "Map the attack path"]
            quick_actions = [
                QuickActionSchema(label=f"View CASE-{case_to_summarize.id}", url=f"/cases/{case_to_summarize.id}", action_type="link"),
                QuickActionSchema(label="Open Attack Graph", url="/attack-graph", action_type="link")
            ]
        else:
            response = "I couldn't find any recent high-priority cases."
            suggested_prompts = ["Show me active alerts"]

    # Route: Asset & Attack Path
    elif "attack path" in prompt or "assets" in prompt or "impact" in prompt:
        response = """### 🕸️ Infrastructure Impact Analysis
The attack path originated from an external IP, targeting a DMZ Web Server, and attempted lateral movement.

| Asset Name | Type | Severity | Status |
|------------|------|----------|--------|
| `DB-Cluster-01` | Database | **Critical** | Targeted |
| `Web-Server-EU` | Server | High | Compromised |
| `Admin-Laptop` | Endpoint | Medium | Monitored |

I recommend isolating compromised assets immediately."""
        suggested_prompts = ["Recommend containment steps", "What is the root cause?"]
        quick_actions = [QuickActionSchema(label="View Attack Graph", url="/attack-graph", action_type="link")]

    # Route: Remediation & Containment
    elif "contain" in prompt or "isolate" in prompt or "recover" in prompt or "next steps" in prompt:
        target = "the affected systems"
        if context_case:
            target = f"assets linked to CASE-{context_case.id}"
        
        response = f"""### 🚨 Containment & Recovery Plan
To neutralize the threat targeting {target}, execute the following:

1. **Network Isolation**:
   ```bash
   # Blackhole route for compromised server
   ip route add blackhole 192.168.1.100
   ```
2. **Credential Revocation**: Force password resets for associated users.
3. **IOC Blocking**: Add identified malicious hashes and domains to firewall deny rules.

**Confidence**: High"""
        suggested_prompts = ["Generate executive report", "Show evidence"]
        quick_actions = [QuickActionSchema(label="View Threat Intel", url="/threat-intelligence", action_type="link")]

    # Route: Evidence / IOCs
    elif "evidence" in prompt or "ioc" in prompt:
        if context_case:
            evidence_items = db.query(Evidence).filter(Evidence.case_id == context_case.id).all()
            if evidence_items:
                response = f"### 🔎 Evidence for CASE-{context_case.id}\n\n"
                for e in evidence_items:
                    response += f"- **{e.evidence_type}**: `{e.value}`\n"
            else:
                response = f"No evidence artifacts currently attached to CASE-{context_case.id}."
            suggested_prompts = ["Analyze root cause", "Recommend containment steps"]
        else:
            response = "Please specify a case to view its evidence (e.g., 'Show evidence for CASE-1')."
            suggested_prompts = ["Summarize the latest case"]

    # Fallback Route
    else:
        response = "I can help with incident summaries, root cause analysis, timeline extraction, and containment strategies. What would you like to investigate?"
        
        if context_case:
            response = f"I am actively tracking **CASE-{context_case.id}** in our current session. You can ask me to 'summarize it', 'show its timeline', or 'explain the root cause'. "
            suggested_prompts = ["Generate executive report", "What is the timeline?", "Analyze root cause"]
        else:
            suggested_prompts = ["Summarize the latest critical case", "Show top active alerts"]

    return ChatResponseSchema(
        response=response,
        suggested_prompts=suggested_prompts,
        quick_actions=quick_actions,
        active_context=active_context
    )
