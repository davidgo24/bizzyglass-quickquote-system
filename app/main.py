from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from typing import List
from datetime import datetime
import uuid

from . import models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
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
        "timestamp": datetime.utcnow().isoformat()
    }

    db_lead.messages = db_lead.messages + [new_message]
    flag_modified(db_lead, "messages")
    
    db.commit()
    db.refresh(db_lead)
    return db_lead
