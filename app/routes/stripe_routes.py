# app/routes/stripe_routes.py

from fastapi import APIRouter
from pydantic import BaseModel
import stripe # Only import stripe, no dotenv or os needed here

router = APIRouter()

class StripeLinkRequest(BaseModel):
    amount: int
    label: str

@router.post("/create-stripe-link")
def create_stripe_link(data: StripeLinkRequest):
    # Stripe API key is already set globally in main.py upon app startup
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": data.label},
                "unit_amount": data.amount * 100,
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url="http://localhost:8080/success",
        cancel_url="http://localhost:8080/cancel",
    )
    return {"url": session.url}
