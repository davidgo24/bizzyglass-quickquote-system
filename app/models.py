
from sqlalchemy import Column, Integer, String, DateTime, Text, ARRAY
from sqlalchemy.sql import func
from .database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    firstName = Column(String, index=True)
    lastName = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    email = Column(String, index=True)
    make = Column(String)
    model = Column(String)
    year = Column(String)
    bodyType = Column(String)
    urgency = Column(String)
    damageDescription = Column(Text)
    status = Column(String, default="NEW")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    # For simplicity, storing messages as an array of strings for now.
    # A separate Message model would be better for a more complex system.
    messages = Column(ARRAY(String))
