from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class UserBase(BaseModel):
    full_name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    bio: Optional[str] = ""
    location: Optional[str] = ""
    profile_photo: Optional[str] = None
    is_pro: bool = False
    plan: PlanType = PlanType.FREE
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_photo: Optional[str] = None

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class URLBase(BaseModel):
    original_url: str
    custom_alias: Optional[str] = None
    expiry_date: Optional[datetime] = None
    password: Optional[str] = None
    # Advanced Pro Features
    is_active: Optional[bool] = True
    webhook_url: Optional[str] = None
    smart_redirect_geo: Optional[Dict[str, str]] = None # { "US": "...", "IN": "..." }
    smart_redirect_os: Optional[Dict[str, str]] = None # { "Android": "...", "iOS": "..." }
    show_splash_screen: Optional[bool] = False
    splash_logo_url: Optional[str] = None
    retargeting_pixels: Optional[List[dict]] = None # [ { "type": "fb", "pixel_id": "..." } ]
    max_clicks: Optional[int] = None
    # New Suite Features
    ab_targets: Optional[List[dict]] = None # [ { "url": "...", "weight": 50 } ]
    qr_style: Optional[dict] = None # Metadata for frontend qr-code-styling

class URLCreate(URLBase):
    pass

class URLResponse(URLBase):
    id: str = Field(..., alias="_id")
    short_code: str
    user_id: str
    clicks: int = 0
    created_at: datetime
    qr_code: Optional[str] = None
    # Ensure all fields are present in response
    is_active: bool = True
    
    class Config:
        populate_by_name = True

# --- Industrial System Schemas ---

class APIKeyPermission(str, Enum):
    READ = "read"
    WRITE = "write"
    ANALYTICS = "analytics"
    ADMIN = "admin"

class APIKeyCreate(BaseModel):
    name: str
    permissions: List[APIKeyPermission] = [APIKeyPermission.READ]
    expires_at: Optional[datetime] = None
    rate_limit_override: Optional[int] = None # RPM

class APIKeyResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    user_id: str
    key_prefix: str # Show first 8 chars only for security
    key: Optional[str] = None # Only returned on creation
    permissions: List[APIKeyPermission]
    rate_limit: int
    expires_at: Optional[datetime] = None
    status: str = "active"
    last_used: Optional[datetime] = None
    created_at: datetime

    class Config:
        populate_by_name = True

class ClientDeviceCreate(BaseModel):
    name: str
    api_key_id: str
    metadata: Optional[Dict[str, Any]] = None

class ClientDeviceResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    user_id: str
    api_key_id: str
    status: str = "active"
    metadata: Optional[Dict[str, Any]] = {}
    last_active: Optional[datetime] = None
    created_at: datetime
    usage_stats: Dict[str, int] = {"api_calls": 0}

    class Config:
        populate_by_name = True

class EventType(str, Enum):
    LINK_CLICK = "link_click"
    SCAN = "scan"
    API_CALL = "api_call"
    CONVERSION = "conversion"

class EventResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    event_type: EventType
    url_id: Optional[str] = None
    device: str
    os: str
    location: str
    timestamp: datetime
    metadata: Dict[str, Any] = {}

    class Config:
        populate_by_name = True

class WebhookCreate(BaseModel):
    url: HttpUrl
    events: List[EventType]
    secret: Optional[str] = None

class WebhookResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    url: str
    events: List[EventType]
    is_active: bool = True
    created_at: datetime

    class Config:
        populate_by_name = True

class WebhookLogResponse(BaseModel):
    id: str = Field(..., alias="_id")
    webhook_id: str
    event_type: str
    payload: Dict[str, Any]
    status: str # success, failed
    response_code: Optional[int] = None
    attempts: int
    timestamp: datetime

    class Config:
        populate_by_name = True

class AutomationRuleCreate(BaseModel):
    name: str
    event_type: EventType
    condition: Dict[str, Any] # e.g. {"field": "clicks", "operator": ">", "value": 1000}
    action: str # e.g. "trigger_webhook", "send_email", "redirect_url"
    action_target: str # e.g. webhook_id, email, or URL

class AutomationRuleResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    name: str
    event_type: EventType
    condition: Dict[str, Any]
    action: str
    action_target: str
    is_active: bool = True
    created_at: datetime

    class Config:
        populate_by_name = True

class AnalyticsData(BaseModel):
    url_id: str
    timestamp: datetime
    device: str
    os_name: str
    browser: str
    ip: str
    location: Optional[str] = "Unknown"
    country_code: Optional[str] = "XX"

class Subscriber(BaseModel):
    email: EmailStr
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
