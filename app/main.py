from fastapi import FastAPI, HTTPException, status, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

import stripe
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from twilio.rest import Client

from app.database import engine, Base, get_db
from app.models import Lead as DBLead
from app.routes import stripe_routes
from app.schemas import LeadCreate, MessageCreate, QuotePayload, StripeCheckoutRequest, Lead, Message, FinalQuoteMessagePayload



load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stripe_routes.router)


stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe.api_key:
    print("WARNING: STRIPE_SECRET_KEY is not set. Stripe operations may fail.")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        print("Twilio client initialized successfully.")
    except Exception as e:
        print(f"Error initializing Twilio client: {e}")
else:
    print("WARNING: Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) not fully set. SMS sending will be disabled.")
    if not TWILIO_PHONE_NUMBER:
        print("WARNING: TWILIO_PHONE_NUMBER is also not set.")


def send_sms(to_number: str, body: str):
    if not to_number.startswith('+'):
        to_number = f"+1{to_number.replace(' ', '').replace('-', '')}"

    if not twilio_client or not TWILIO_PHONE_NUMBER:
        print(f"SMS not sent: Twilio client or phone number not configured. To: {to_number}, Message: '{body}'")
        return
    try:
        message = twilio_client.messages.create(
            to=to_number,
            from_=TWILIO_PHONE_NUMBER,
            body=body
        )
        print(f"SMS sent successfully to {to_number}. SID: {message.sid}")
    except Exception as e:
        print(f"Failed to send SMS to {to_number}: {e}")
        if hasattr(e, 'code'):
            print(f"Twilio Error Code: {e.code}")
        if hasattr(e, 'msg'):
            print(f"Twilio Error Message: {e.msg}")


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
    vin: Optional[str] = None # Ensure this is present in your schemas.py as well

class LeadCreate(LeadBase):
    pass

class MessageCreate(BaseModel):
    message: str

class FinalQuoteMessagePayload(BaseModel):
    lead_id: int
    message_content: str

class QuotePayload(BaseModel):
    lead_id: int
    total_amount: float
    payment_option: str
    deposit_amount: Optional[float] = None
    deposit_percentage: Optional[float] = None
    customer_name: str
    services_summary: str
    appointment_slots: Optional[List[str]] = []
    invoice_description: Optional[str] = None
    make: str
    model: str

class StripeCheckoutRequest(BaseModel):
    lead_id: str
    full_amount: float
    deposit_amount: Optional[float] = None
    description: str
    mode: str

class Lead(LeadBase):
    id: int
    status: str
    createdAt: datetime
    messages: Optional[List[Message]] = []

    class Config:
        orm_mode = True


@app.get("/api/leads", response_model=List[Lead])
def get_all_leads(db: Session = Depends(get_db)):
    leads = db.query(DBLead).all()
    return leads

@app.get("/api/leads/{lead_id}", response_model=Lead)
def get_single_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(DBLead).filter(DBLead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    db.refresh(lead) # <--- ADDED THIS LINE
    return lead

@app.post("/api/leads", response_model=Lead, status_code=status.HTTP_201_CREATED)
def create_new_lead(lead_data: LeadCreate, db: Session = Depends(get_db)):
    initial_message_body = (
        f"Hi {lead_data.firstName}, thanks for your inquiry with BizzyGlass! "
        f"We're reviewing your request and will get back to you shortly."
    )
    
    initial_message = Message(
        id="1",
        sender="owner",
        message=initial_message_body,
        timestamp=datetime.now(timezone.utc).isoformat()
    )

    db_lead = DBLead(
        status="NEW",
        createdAt=datetime.now(timezone.utc),
        messages=[initial_message.dict()],
        **lead_data.dict()
    )
    
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)

    send_sms(db_lead.phone, initial_message_body)

    return db_lead

@app.post("/api/leads/{lead_id}/messages", response_model=Lead)
def add_message_to_lead(lead_id: int, message_data: MessageCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: add_message_to_lead - Received message for lead {lead_id}: {message_data.message[:100]}...")
    lead = db.query(DBLead).filter(DBLead.id == lead_id).first()
    if not lead:
        print(f"ERROR: add_message_to_lead - Lead {lead_id} not found for message update.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    if lead.messages is None:
        lead.messages = []
    
    print(f"DEBUG: add_message_to_lead - Lead {lead_id} messages BEFORE update: {len(lead.messages)} messages. Content: {lead.messages}")

    new_message = Message(
        id=str(len(lead.messages) + 1),
        sender="owner",
        message=message_data.message,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    
    lead.messages.append(new_message.dict())
    
    flag_modified(lead, "messages")

    db.add(lead)
    db.commit()
    db.refresh(lead)

    print(f"DEBUG: add_message_to_lead - Lead {lead_id} messages AFTER update: {len(lead.messages)} messages. Content: {lead.messages}")

    send_sms(lead.phone, new_message.message)
    return lead


@app.post("/api/create-checkout-session")
def create_checkout_session(data: StripeCheckoutRequest):
    try:
        amount = int(data.full_amount * 100)
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": data.description},
                    "unit_amount": amount,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url="http://localhost:8080/success",
            cancel_url="http://localhost:8080/cancel",
            metadata={"lead_id": data.lead_id, "mode": data.mode},
        )
        return {"checkout_url": session.url}
    except Exception as e:
        print(f"Error creating Stripe checkout session: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/api/generate-quote-message")
def generate_quote_message(payload: QuotePayload):
    full_url = None
    deposit_url = None
    quote_message_body = ""

    base_invoice_details = f"Service for {payload.customer_name} ({payload.make} {payload.model})"
    if payload.services_summary:
        cleaned_services_summary = payload.services_summary.replace('## OEM Services', '').replace('## Aftermarket Services', '').replace('## Custom Services', '').replace('## Add-ons', '').replace('## Custom Add-ons', '').strip()
        cleaned_services_summary = cleaned_services_summary.replace('\n• ', ', ').replace('\n', ', ').strip()
        if cleaned_services_summary:
            base_invoice_details += f" - Services: {cleaned_services_summary}"

    invoice_description_full = f"Full Payment: {base_invoice_details}"
    invoice_description_deposit = f"Deposit: {base_invoice_details}"

    if payload.invoice_description and payload.invoice_description.strip():
        invoice_description_full += f" - {payload.invoice_description.strip()}"
        invoice_description_deposit += f" - {payload.invoice_description.strip()}"

    max_stripe_description_length = 200
    if len(invoice_description_full) > max_stripe_description_length:
        invoice_description_full = invoice_description_full[:max_stripe_description_length-3] + "..."
    if len(invoice_description_deposit) > max_stripe_description_length:
        invoice_description_deposit = invoice_description_deposit[:max_stripe_description_length-3] + "..."


    try:
        if payload.payment_option == "full" or payload.payment_option == "both":
            full_url = create_checkout_session(StripeCheckoutRequest(
                lead_id=str(payload.lead_id),
                full_amount=payload.total_amount,
                description=invoice_description_full,
                mode="full"
            ))["checkout_url"]

        if payload.payment_option == "deposit" or payload.payment_option == "both":
            if payload.deposit_amount is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Deposit amount required for deposit option.")
            deposit_url = create_checkout_session(StripeCheckoutRequest(
                lead_id=str(payload.lead_id),
                full_amount=payload.deposit_amount,
                description=invoice_description_deposit,
                mode="deposit"
            ))["checkout_url"]
        
        if payload.payment_option not in ["full", "deposit", "both"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment option selected.")

        parts = [f"Hi {payload.customer_name}! Here's your quote:\n"]
        parts.append(payload.services_summary)
        
        if full_url:
            parts.append(f"\n💳 Full Payment: {full_url}")
        if deposit_url:
            parts.append(f"\n🔐 Deposit Option: {deposit_url}")
        
        if payload.appointment_slots:
            parts.append("\n\n📅 Available times:\n" + "\n".join(payload.appointment_slots))
        else:
            parts.append("\n\n📅 Please contact us to schedule your service.")

        quote_message_body = "\n".join(parts)

        print(f"DEBUG: generate_quote_message - Generated quote message: {quote_message_body[:100]}...")

        return {
            "quote_message": quote_message_body,
            "full_url": full_url,
            "deposit_url": deposit_url,
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error generating quote message: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate quote: {e}")


@app.post("/api/send-final-quote", response_model=Lead)
def send_final_quote(payload: FinalQuoteMessagePayload, db: Session = Depends(get_db)):
    print(f"DEBUG: send_final_quote - Received final message for lead {payload.lead_id}: {payload.message_content[:100]}...")
    lead = db.query(DBLead).filter(DBLead.id == payload.lead_id).first()
    if not lead:
        print(f"ERROR: send_final_quote - Lead {payload.lead_id} not found for message update.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    if lead.messages is None:
        lead.messages = []
    
    print(f"DEBUG: send_final_quote - Lead {payload.lead_id} messages BEFORE update: {len(lead.messages)} messages. Content: {lead.messages}")

    new_message = Message(
        id=str(len(lead.messages) + 1),
        sender="owner",
        message=payload.message_content,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    
    lead.messages.append(new_message.dict())
    
    flag_modified(lead, "messages")

    db.add(lead)
    db.commit()
    db.refresh(lead)

    print(f"DEBUG: send_final_quote - Lead {payload.lead_id} messages AFTER update: {len(lead.messages)} messages. Content: {lead.messages}")

    send_sms(lead.phone, new_message.message)
    return lead

@app.post("/api/twilio-webhook")
async def receive_incoming_sms(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    from_number = form_data.get("From")
    body = form_data.get("Body")
    timestamp = datetime.now(timezone.utc).isoformat()

    if not from_number or not body:
        raise HTTPException(status_code=400, detail="Missing From or Body")

    # Normalize number for DB matching
    normalized_number = from_number.replace("+1", "").replace("-", "").replace(" ", "")

    # Find the matching lead by phone number
    lead = db.query(DBLead).filter(DBLead.phone.ilike(f"%{normalized_number[-10:]}")).first()
    if not lead:
        print(f"No matching lead found for number: {from_number}")
        return "OK"

    if lead.messages is None:
        lead.messages = []

    incoming_message = Message(
        id=str(len(lead.messages) + 1),
        sender="client",
        message=body,
        timestamp=timestamp
    )
    lead.messages.append(incoming_message.dict())
    flag_modified(lead, "messages")

    db.add(lead)
    db.commit()

    print(f"📩 Received reply from {from_number}: {body}")
    return "OK"
