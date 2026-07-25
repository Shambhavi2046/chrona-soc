from pydantic import BaseModel
from typing import List, Optional

class QuickActionSchema(BaseModel):
    label: str
    url: str
    action_type: str # link, copy, report

class ChatMessageSchema(BaseModel):
    role: str # user, assistant
    content: str
    timestamp: str

class ChatRequestSchema(BaseModel):
    prompt: str
    history: List[ChatMessageSchema]

class ActiveContextSchema(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    risk_score: int
    asset_count: int
    type: str # "Case", "Alert"

class ChatResponseSchema(BaseModel):
    response: str
    suggested_prompts: List[str]
    quick_actions: List[QuickActionSchema]
    active_context: Optional[ActiveContextSchema] = None
