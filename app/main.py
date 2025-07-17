from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from typing import List
from datetime import datetime, timezone
import uuid
import os
from twilio.rest import Client

from . import models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Twilio Client Initialization
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/leads", response_model=List[schemas.Lead])
def get_leads(db: Session = Depends(get_db)):
    leads = db.query(models.Lead).all()
    return leads

@app.post("/api/leads", response_model=schemas.Lead)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    db_lead = models.Lead(**lead.dict())

    # Construct initial message for chat history
    initial_message_body = f"Hi {db_lead.firstName}, thanks for your inquiry with BizzyGlass! We've received your request and will get back to you shortly."
    initial_message = {
        "id": str(uuid.uuid4()),
        "sender": "owner", # This message is sent by BizzyGlass (owner)
        "message": initial_message_body,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # Ensure messages list is initialized and append the initial message
    if db_lead.messages is None:
        db_lead.messages = []
    db_lead.messages.append(initial_message)
    flag_modified(db_lead, "messages") # Mark as modified for SQLAlchemy

    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)

    # Send initial SMS confirmation via Twilio
    try:
        twilio_client.messages.create(
            to=db_lead.phone,
            from_=TWILIO_PHONE_NUMBER,
            body=initial_message_body
        )
    except Exception as e:
        print(f"Error sending Twilio SMS: {e}")

    return db_lead

@app.post("/api/leads/{lead_id}/messages", response_model=schemas.Lead)
def add_message_to_lead(lead_id: int, message: schemas.MessageCreate, db: Session = Depends(get_db)):
    db_lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if db_lead.messages is None:
        db_lead.messages = []

    new_message = {
        "id": str(uuid.uuid4()),
        "sender": "owner",
        "message": message.message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    db_lead.messages = db_lead.messages + [new_message]
    flag_modified(db_lead, "messages")
    
    db.commit()
    db.refresh(db_lead)

    # Send message via Twilio
    try:
        twilio_client.messages.create(
            to=db_lead.phone,
            from_=TWILIO_PHONE_NUMBER,
            body=message.message
        )
    except Exception as e:
        print(f"Error sending Twilio SMS: {e}")

    return db_lead
