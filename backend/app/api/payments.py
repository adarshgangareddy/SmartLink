from fastapi import APIRouter, Depends, HTTPException, status, Request
from .auth import get_current_user
from ..core.config import settings
from ..core.database import get_database
import razorpay
import hmac
import hashlib

router = APIRouter()

import logging
import traceback

logger = logging.getLogger(__name__)

# Initialize Razorpay client with fallback for dev/demo
RAZORPAY_KEY_ID = settings.RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET = settings.RAZORPAY_KEY_SECRET

def get_razorpay_client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET or RAZORPAY_KEY_ID == "YOUR_KEY_ID":
        logger.warning("Razorpay keys missing or default. Payments will be in MOCK mode.")
        return None
    try:
        return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except Exception as e:
        logger.error(f"Failed to initialize Razorpay client: {str(e)}")
        return None

@router.post("/create-order")
async def create_order(current_user: dict = Depends(get_current_user)):
    client = get_razorpay_client()
    if not client:
        # Mock order for development if secrets are missing
        return {
            "id": f"order_mock_{current_user['_id'][:8]}",
            "amount": 1800,
            "currency": "INR",
            "mock": True,
            "message": "Razorpay keys not configured. This is a mock order."
        }
        
    try:
        # Amount in paise (18 INR = 1800 paise)
        order_data = {
            "amount": 1800,
            "currency": "INR",
            "receipt": f"receipt_{current_user['_id'][:8]}",
            "notes": {
                "user_id": current_user["_id"],
                "email": current_user["email"]
            }
        }
        logger.info(f"Creating Razorpay order for user: {current_user['email']}")
        order = client.order.create(data=order_data)
        return order
    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay Bad Request: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Razorpay Error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error creating Razorpay order: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

@router.post("/verify-payment")
async def verify_payment(data: dict, current_user: dict = Depends(get_current_user)):
    try:
        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        client = get_razorpay_client()
        if not client or "mock" in razorpay_order_id:
            # Handle mock verification
            db = get_database()
            await db.users.update_one(
                {"_id": current_user["_id"]},
                {"$set": {"is_pro": True}}
            )
            return {"status": "success", "message": "Upgraded to Pro successfully (MOCK)"}

        # Verify signature
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        try:
            client.utility.verify_payment_signature(params_dict)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid payment signature")

        # Upgrade user to Pro
        db = get_database()
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"is_pro": True}}
        )
        
        return {"status": "success", "message": "Upgraded to Pro successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification Error: {str(e)}")
