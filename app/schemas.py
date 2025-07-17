
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class Message(BaseModel):
    id: str
    sender: str
    message: str
    timestamp: str

class LeadBase(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    make: str
    model: str
    year: str
    bodyType: str
    urgency: str
    damageDescription: str

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    id: int
    status: str
    createdAt: datetime
    messages: Optional[List[str]] = []

    class Config:
        orm_mode = True
