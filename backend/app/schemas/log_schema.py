from pydantic import BaseModel, ConfigDict
from datetime import datetime


class LogCreate(BaseModel):
    source: str
    event: str
    severity: str
    timestamp: datetime


class LogResponse(BaseModel):
    id: int
    source: str
    event: str
    severity: str
    timestamp: datetime

    model_config = ConfigDict(
        from_attributes=True
    )