# app/models.py

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB # Keep JSONB import
from sqlalchemy.sql import func
from sqlalchemy.ext.mutable import MutableList # Import MutableList
# No need for 'import json' or 'TypeDecorator' or 'TEXT' for this approach
from datetime import datetime, timezone

from .database import Base

# Removed JSONEncodedDict and JSONMutableList classes.
# We will apply MutableList.as_mutable directly to JSONB in the Column definition.

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    firstName = Column(String, index=True)
    lastName = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    email = Column(String, index=True, nullable=True)
    make = Column(String)
    model = Column(String)
    year = Column(String)
    bodyType = Column(String)
    urgency = Column(String)
    damageDescription = Column(Text)
    status = Column(String, default="NEW")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    # Use MutableList.as_mutable(JSONB) directly for JSONB fields that are lists
    messages = Column(MutableList.as_mutable(JSONB), default=[])

    # NEW FIELD: VIN
    vin = Column(String, nullable=True)

    # Existing optional fields from the form, also using MutableList.as_mutable(JSONB)
    glassToReplace = Column(MutableList.as_mutable(JSONB), default=[])
    addonServices = Column(MutableList.as_mutable(JSONB), default=[])
    preferredDate = Column(String, nullable=True)
    preferredTime = Column(String, nullable=True)
    preferredDaysTimes = Column(MutableList.as_mutable(JSONB), default=[])
