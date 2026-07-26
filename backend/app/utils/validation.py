import re
from typing import Optional
from pydantic import BaseModel, ConfigDict
from fastapi import Query

class BaseModelConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)

def is_valid_email(email: str) -> bool:
    regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return bool(re.match(regex, email))

def is_strong_password(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 100

def get_pagination(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)) -> PaginationParams:
    return PaginationParams(skip=skip, limit=limit)
