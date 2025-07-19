from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.routes import stripe_routes
import stripe
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from twilio.rest import Client

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

class LeadCreate(LeadBase):
    pass

class MessageCreate(BaseModel):
    message: str

class QuotePayload(BaseModel):
    lead_id: int
    total_amount: float
    payment_option: str
    deposit_amount: Optional[float] = None
    deposit_percentage: Optional[float] = None
    customer_name: str
    services_summary: str
    appointment_slots: Optional[List[str]] = []

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

in_memory_leads: List[Lead] = []
next_lead_id = 1

@app.get("/api/leads", response_model=List[Lead])
def get_all_leads():
    return in_memory_leads

@app.get("/api/leads/{lead_id}", response_model=Lead)
def get_single_lead(lead_id: int):
    for lead in in_memory_leads:
        if lead.id == lead_id:
            return lead
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

@app.post("/api/leads", response_model=Lead, status_code=status.HTTP_201_CREATED)
def create_new_lead(lead_data: LeadCreate):
    global next_lead_id
    
    # Create the initial message object
    initial_message_body = (
        f"Hi {lead_data.firstName}, thanks for your inquiry with BizzyGlass! "
        f"We're reviewing your request and will get back to you shortly."
    )
    initial_message = Message(
        id="1", # First message, ID 1
        sender="system", # Or 'owner' if you consider it from your side
        message=initial_message_body,
        timestamp=datetime.now().isoformat()
    )

    new_lead = Lead(
        id=next_lead_id,
        status="NEW",
        createdAt=datetime.now(),
        messages=[initial_message], # Initialize with the first message
        **lead_data.dict()
    )
    in_memory_leads.append(new_lead)
    next_lead_id += 1

    # Send initial SMS to the customer
    send_sms(new_lead.phone, initial_message_body)

    return new_lead

@app.post("/api/leads/{lead_id}/messages", response_model=Lead)
def add_message_to_lead(lead_id: int, message_data: MessageCreate):
    for lead in in_memory_leads:
        if lead.id == lead_id:
            new_message = Message(
                id=str(len(lead.messages) + 1),
                sender="owner",
                message=message_data.message,
                timestamp=datetime.now().isoformat()
            )
            lead.messages.append(new_message)

            # Send the message content (e.g., quote) as an SMS to the customer
            send_sms(lead.phone, new_message.message)
            return lead
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")


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

    try:
        if payload.payment_option == "full" or payload.payment_option == "both":
            full_url = create_checkout_session(StripeCheckoutRequest(
                lead_id=str(payload.lead_id),
                full_amount=payload.total_amount,
                description=f"{payload.customer_name} - Full Payment",
                mode="full"
            ))["checkout_url"]

        if payload.payment_option == "deposit" or payload.payment_option == "both":
            if payload.deposit_amount is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Deposit amount required for deposit option.")
            deposit_url = create_checkout_session(StripeCheckoutRequest(
                lead_id=str(payload.lead_id),
                full_amount=payload.deposit_amount,
                description=f"{payload.customer_name} - Deposit",
                mode="deposit"
            ))["checkout_url"]
        
        if payload.payment_option not in ["full", "deposit", "both"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment option selected.")

        parts = [f"Hello {payload.customer_name}, here's your quote for the services below:\n"]
        parts.append(payload.services_summary)
        
        if full_url:
            parts.append(f"\n💳 Full Payment: {full_url}")
        if deposit_url:
            parts.append(f"\n🔐 Deposit Option: {deposit_url}")
        
        if payload.appointment_slots:
            parts.append("\n\n📅 Available times:\n" + "\n".join(payload.appointment_slots))
        else:
            parts.append("\n\n📅 Please contact us to schedule your service.")

        return {
            "quote_message": "\n".join(parts),
            "full_url": full_url,
            "deposit_url": deposit_url,
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error generating quote message: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate quote: {e}")
