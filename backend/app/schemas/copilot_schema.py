from pydantic import BaseModel, Field
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
    status: Optional[str] = None
    priority: str
    risk_score: Optional[int] = None
    asset_count: int = 0
    type: str # "Case", "Alert"

class ChatResponseSchema(BaseModel):
    response: str
    suggested_prompts: List[str] = Field(default_factory=list)
    quick_actions: List[QuickActionSchema] = Field(default_factory=list)
    active_context: Optional[ActiveContextSchema] = None
