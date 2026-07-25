from pydantic import BaseModel, ConfigDict
from datetime import datetime


class AlertResponse(BaseModel):
    id: int
    log_id: int
    threat_type: str
    risk_score: int
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )