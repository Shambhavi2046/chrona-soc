from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

DataT = TypeVar("DataT")

class BaseResponse(BaseModel, Generic[DataT]):
    success: bool = True
    message: Optional[str] = None
    data: Optional[DataT] = None
