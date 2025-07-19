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
    glassToReplace: Optional[List[str]] = []
    addonServices: Optional[List[str]] = []
    preferredDate: Optional[str] = None
    preferredTime: Optional[str] = None
    preferredDaysTimes: Optional[List[str]] = []

class LeadCreate(LeadBase):
    pass

class MessageCreate(BaseModel):
    message: str

# NEW: QuotePayload model moved from main.py
class QuotePayload(BaseModel):
    lead_id: int
    total_amount: float
    payment_option: str  # 'full', 'deposit', 'both'
    deposit_amount: Optional[float] = None
    deposit_percentage: Optional[float] = None
    customer_name: str
    services_summary: str
    appointment_slots: Optional[List[str]] = []

# NEW: StripeCheckoutRequest model moved from main.py
class StripeCheckoutRequest(BaseModel):
    lead_id: str
    full_amount: float
    deposit_amount: Optional[float] = None
    description: str
    mode: str  # "full", "deposit", "both"

class Lead(LeadBase):
    id: int
    status: str
    createdAt: datetime
    messages: Optional[List[Message]] = []

    class Config:
        orm_mode = True
