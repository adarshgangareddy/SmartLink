from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.config import settings
from ..core.database import get_database
from ..schemas.base import UserCreate, Token, UserResponse, ForgotPassword, ResetPassword
from datetime import datetime, timedelta
import uuid
import random
from ..services.email import send_reset_email

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme)
):
    db = get_database()
    
    # 1. Try API Key Authentication (Hashed)
    api_key = request.headers.get("X-API-Key")
    if api_key:
        from ..services.industrial_service import IndustrialService
        hashed_key = IndustrialService.hash_key(api_key)
        api_key_data = await db.api_keys.find_one({"hashed_key": hashed_key, "status": "active"})
        
        if api_key_data:
            # Check expiration
            if api_key_data.get("expires_at") and api_key_data["expires_at"] < datetime.utcnow():
                 raise HTTPException(status_code=403, detail="API Key has expired")
            
            user = await db.users.find_one({"_id": api_key_data["user_id"]})
            if user:
                # Track this API call for analytics
                import asyncio
                asyncio.create_task(IndustrialService.track_event(
                    user_id=user["_id"],
                    event_type="api_call",
                    metadata={"path": request.url.path, "key_id": api_key_data["_id"]}
                ))
                
                # Inject key metadata into user object for middleware/routes
                user["_api_key_id"] = api_key_data["_id"]
                user["_permissions"] = api_key_data.get("permissions", ["read"])
                user["_rate_limit_override"] = api_key_data.get("rate_limit_override")
                return user

    # 2. Try Bearer Token Authentication
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please provide a valid Bearer token or X-API-Key.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # If oauth2_scheme failed to find a token, it might raise an exception automatically.
    # However, for API keys we might need to bypass it. 
    # Since oauth2_scheme is required for this dependency, we handle it here:
    if not token and not api_key:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=Token)
async def signup(user_in: UserCreate):
    db = get_database()
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        "_id": str(uuid.uuid4()),
        "full_name": user_in.full_name,
        "email": user_in.email,
        "password": get_password_hash(user_in.password),
        "created_at": datetime.utcnow(),
        "bio": "",
        "location": "",
        "profile_photo": None,
        "is_pro": False,
        "reset_token": None,
        "reset_expires": None,
        "otp": None,
        "otp_expires": None
    }
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user_in.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    db = get_database()
    user = await db.users.find_one({"email": data.email})
    if not user:
        # For security reasons, don't reveal if user exists
        return {"msg": "If your email is registered, you will receive an OTP."}
    
    otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
    expires = datetime.utcnow() + timedelta(minutes=15)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"otp": otp, "otp_expires": expires}}
    )
    
    email_sent = send_reset_email(data.email, otp)
    if not email_sent:
        raise HTTPException(
            status_code=500, 
            detail="Failed to send reset email. This may be due to AWS SES restrictions (Sandbox mode) or configuration errors."
        )
        
    return {"msg": "If your email is registered, you will receive an OTP."}

@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    db = get_database()
    user = await db.users.find_one({
        "email": data.email,
        "otp": data.otp,
        "otp_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    hashed_pw = get_password_hash(data.new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed_pw, "otp": None, "otp_expires": None}}
    )
    return {"msg": "Password reset successfully"}

@router.post("/subscribe")
async def subscribe(data: dict):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    db = get_database()
    existing = await db.subscribers.find_one({"email": email})
    if existing:
        return {"msg": "Already subscribed!"}
        
    await db.subscribers.insert_one({
        "email": email,
        "subscribed_at": datetime.utcnow()
    })
    return {"msg": "Subscribed successfully!"}

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: dict, # Simplified for now, can use UserUpdate schema if preferred
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    updatable_fields = ["full_name", "bio", "location", "profile_photo", "is_pro"]
    update_dict = {k: v for k, v in profile_data.items() if k in updatable_fields}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid fields to update")
        
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_dict}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return updated_user
