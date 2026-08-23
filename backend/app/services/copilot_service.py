from sqlalchemy.orm import Session
from app.models.operations import Case, TimelineEvent, Evidence
from app.models.alert_model import Alert
from app.schemas.copilot_schema import ChatRequestSchema, ChatResponseSchema, QuickActionSchema, ActiveContextSchema
from pydantic import BaseModel, Field
from typing import List, Tuple, Optional

class LLMResponseSchema(BaseModel):
    response: str = Field(description="The natural language response to the user's prompt in Markdown format.")
    suggested_prompts: List[str] = Field(description="A list of 2-3 suggested follow-up questions for the user.")
    quick_actions: List[QuickActionSchema] = Field(description="A list of UI quick actions related to the response (e.g. view case URL).")

import re

def _extract_case_id_from_text(text: str) -> Optional[str]:
    match = re.search(r'case(?:-|\s+)?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})', text.lower())
    if match:
        return match.group(1)
    return None

def _get_context_case_id(request: ChatRequestSchema) -> Optional[str]:
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

import uuid

def process_chat(db: Session, request: ChatRequestSchema, org_id: uuid.UUID) -> ChatResponseSchema:
    prompt = request.prompt.lower()

    response = ""
    suggested_prompts = []
    quick_actions = []
    active_context = None

    case_id_str = _get_context_case_id(request)
    context_case = None
    if case_id_str:
        try:
            case_id = uuid.UUID(case_id_str)
            context_case = db.query(Case).filter(Case.id == case_id, Case.org_id == org_id).first()
        except ValueError:
            context_case = None

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

    # If no explicit case, but user asks about latest/recent case, fetch it
    if not context_case and any(w in prompt for w in ["latest", "recent", "summarize", "active"]):
        context_case = db.query(Case).filter(Case.priority.in_(["Critical", "High"]), Case.org_id == org_id).order_by(Case.created_at.desc()).first()
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

    llm_response = None
    from app.core.config import settings

    system_prompt = (
        "You are Chrona Copilot, an expert AI Security Operations assistant. "
        "You analyze SOC data, answer cybersecurity questions, and suggest investigation steps. "
        "Respond in pure JSON containing three keys: 'response' (markdown string), "
        "'suggested_prompts' (list of strings), and 'quick_actions' (list of objects with label, url, action_type).\n"
        "CRITICAL RULES FOR quick_actions: For general cybersecurity questions, quick_actions MUST be []. "
        "Never invent, guess, fabricate, or provide placeholder URLs. Never use example.com or any other fictional URL. "
        "Only return a quick_action when a real Chrona UI route is explicitly known from the context.\n"
        "Do NOT hallucinate assets, IPs, or threat actors not present in the provided context."
    )
    
    if context_case:
        timelines = db.query(TimelineEvent).filter(TimelineEvent.case_id == context_case.id).order_by(TimelineEvent.created_at.desc()).limit(10).all()
        evidence_items = db.query(Evidence).filter(Evidence.case_id == context_case.id).all()
        similar_cases = db.query(Case).filter(
            Case.org_id == org_id,
            Case.id != context_case.id,
            Case.priority == context_case.priority
        ).order_by(Case.created_at.desc()).limit(3).all()

        context_str = f"Active Case Context for CASE-{context_case.id}: {context_case.title}\n"
        context_str += f"Status: {context_case.status}, Priority: {context_case.priority}, Risk Score: {context_case.risk_score}\n"
        context_str += f"Created At: {context_case.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        
        if timelines:
            context_str += "\nRecent Timeline Events:\n"
            for t in reversed(timelines):
                context_str += f"- {t.created_at.strftime('%Y-%m-%d %H:%M:%S')} [{t.action_type}]: {t.content}\n"
        else:
            context_str += "\nRecent Timeline Events: None\n"
        
        if evidence_items:
            context_str += "\nCollected Evidence:\n"
            for e in evidence_items:
                context_str += f"- {e.evidence_type}: {e.value}\n"
        else:
            context_str += "\nCollected Evidence: None\n"
        
        if similar_cases:
            context_str += "\nSimilar Historical Cases:\n"
            for sc in similar_cases:
                context_str += f"- CASE-{sc.id}: {sc.title} ({sc.status})\n"

        system_prompt += f"\n\n{context_str}"
    else:
        recent_cases = db.query(Case).filter(Case.priority.in_(["Critical", "High"]), Case.org_id == org_id).order_by(Case.created_at.desc()).limit(3).all()
        if recent_cases:
            context_str = "\n\nRecent High Priority Cases in Tenant:\n"
            for c in recent_cases:
                context_str += f"- CASE-{c.id}: {c.title} (Priority: {c.priority}, Status: {c.status})\n"
            system_prompt += context_str
        else:
            system_prompt += "\n\nThere are currently no active Critical or High priority cases in this tenant."

    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history[-5:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.prompt})

    def filter_valid_actions(actions: List[QuickActionSchema]) -> List[QuickActionSchema]:
        valid = []
        for act in actions:
            # Only allow internal relative routes, dropping hallucinated absolute external URLs
            if act.url and act.url.startswith("/"):
                valid.append(act)
        return valid

    try:
        if getattr(settings, "LLM_PROVIDER", "").lower() == "ollama":
            import urllib.request
            import json
            payload = {
                "model": settings.OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.2}
            }
            req = urllib.request.Request(
                f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat",
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=45) as api_response:
                result = json.loads(api_response.read().decode('utf-8'))
                msg_content = result.get("message", {}).get("content", "{}")

                import pydantic
                # Assuming LLMResponseSchema is available
                llm_parsed = LLMResponseSchema.model_validate_json(msg_content)

                response = llm_parsed.response
                suggested_prompts = llm_parsed.suggested_prompts
                quick_actions = filter_valid_actions(llm_parsed.quick_actions)
                llm_response = True

        elif getattr(settings, "LLM_PROVIDER", "").lower() == "openai" and getattr(settings, "OPENAI_API_KEY", None):
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            completion = client.beta.chat.completions.parse(
                model=settings.OPENAI_MODEL,
                messages=messages,
                response_format=LLMResponseSchema,
                max_tokens=1500,
                temperature=0.2
            )
            parsed_llm = completion.choices[0].message.parsed
            if parsed_llm:
                response = parsed_llm.response
                suggested_prompts = parsed_llm.suggested_prompts
                quick_actions = filter_valid_actions(parsed_llm.quick_actions)
                llm_response = True

    except Exception as e:
        import logging
        logging.error(f"Copilot LLM Error: {str(e)}")
        llm_response = None

    if not llm_response:
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
