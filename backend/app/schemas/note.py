from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class NoteBase(BaseModel):
    content: str = Field(..., min_length=1)

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    content: str = Field(..., min_length=1)

class NoteResponse(BaseModel):
    id: str
    lead_id: str
    user_id: str
    author_name: Optional[str] = None
    content: str
    ai_signals: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
