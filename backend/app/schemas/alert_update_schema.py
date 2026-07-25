from pydantic import BaseModel


class AlertUpdate(BaseModel):
    status: str