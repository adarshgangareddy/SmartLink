from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from typing import List, Optional
from ..core.database import get_database
from .auth import get_current_user
from ..schemas.base import (
    APIKeyCreate, APIKeyResponse, ClientDeviceCreate, ClientDeviceResponse,
    WebhookCreate, WebhookResponse, WebhookLogResponse,
    AutomationRuleCreate, AutomationRuleResponse,
    EventType, URLResponse, URLCreate
)
from ..services.industrial_service import IndustrialService
from .urls import shorten_url
from datetime import datetime
import uuid
import secrets

router = APIRouter()

# --- Pro Gating Helper ---
def check_pro(user: dict):
    if not user.get("is_pro"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Industrial features require a SmartLink Pro or Enterprise subscription."
        )

# --- API KEY MANAGEMENT ---

@router.post("/keys", response_model=APIKeyResponse)
async def create_api_key(key_in: APIKeyCreate, current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    
    raw_key = IndustrialService.generate_api_key()
    hashed_key = IndustrialService.hash_key(raw_key)
    key_id = str(uuid.uuid4())
    
    key_dict = {
        "_id": key_id,
        "name": key_in.name,
        "user_id": current_user["_id"],
        "hashed_key": hashed_key,
        "key_prefix": raw_key[:10],
        "permissions": key_in.permissions,
        "rate_limit_override": key_in.rate_limit_override or (300 if current_user.get("is_pro") else 10),
        "expires_at": key_in.expires_at,
        "status": "active",
        "created_at": datetime.utcnow(),
        "last_used": None
    }
    
    await db.api_keys.insert_one(key_dict)
    # Include raw key only in response once
    response_data = key_dict.copy()
    response_data["key"] = raw_key
    response_data["rate_limit"] = key_dict["rate_limit_override"]
    return response_data

@router.get("/keys", response_model=List[APIKeyResponse])
async def list_api_keys(current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    cursor = db.api_keys.find({"user_id": current_user["_id"]})
    keys = await cursor.to_list(length=100)
    for k in keys:
        k["rate_limit"] = k.get("rate_limit_override", 300)
    return keys

@router.delete("/keys/{key_id}")
async def revoke_api_key(key_id: str, current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    result = await db.api_keys.update_one(
        {"_id": key_id, "user_id": current_user["_id"]},
        {"$set": {"status": "revoked"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="API Key not found")
    return {"message": "API Key revoked"}

# --- CLIENT / DEVICE MANAGEMENT ---

@router.post("/devices", response_model=ClientDeviceResponse)
async def register_device(device_in: ClientDeviceCreate, current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    
    device_dict = {
        "_id": str(uuid.uuid4()),
        "name": device_in.name,
        "user_id": current_user["_id"],
        "api_key_id": device_in.api_key_id,
        "status": "active",
        "metadata": device_in.metadata or {},
        "usage_stats": {"api_calls": 0},
        "created_at": datetime.utcnow(),
        "last_active": None
    }
    await db.devices.insert_one(device_dict)
    return device_dict

@router.get("/devices", response_model=List[ClientDeviceResponse])
async def list_devices(current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    cursor = db.devices.find({"user_id": current_user["_id"]})
    return await cursor.to_list(length=100)

# --- WEBHOOK SYSTEM ---

@router.post("/webhooks", response_model=WebhookResponse)
async def subscribe_webhook(wh_in: WebhookCreate, current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    
    wh_dict = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "url": str(wh_in.url),
        "events": wh_in.events,
        "secret": wh_in.secret or secrets.token_urlsafe(16),
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    await db.webhooks.insert_one(wh_dict)
    return wh_dict

@router.get("/webhooks", response_model=List[WebhookResponse])
async def list_webhooks(current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    cursor = db.webhooks.find({"user_id": current_user["_id"]})
    return await cursor.to_list(length=100)

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(webhook_id: str, current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    result = await db.webhooks.delete_one({"_id": webhook_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return {"message": "Webhook deleted"}

@router.get("/webhooks/logs", response_model=List[WebhookLogResponse])
async def list_webhook_logs(
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    check_pro(current_user)
    db = get_database()
    # Find all webhooks for user
    user_wh_ids = await db.webhooks.distinct("_id", {"user_id": current_user["_id"]})
    
    query = {"webhook_id": {"$in": user_wh_ids}}
    if status:
        query["status"] = status
        
    cursor = db.webhook_logs.find(query).sort("timestamp", -1).limit(50)
    return await cursor.to_list(length=50)

# --- AUTOMATION ENGINE ---

@router.post("/rules", response_model=AutomationRuleResponse)
async def create_rule(rule_in: AutomationRuleCreate, current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    
    rule_dict = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "name": rule_in.name,
        "event_type": rule_in.event_type,
        "condition": rule_in.condition,
        "action": rule_in.action,
        "action_target": rule_in.action_target,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    await db.automation_rules.insert_one(rule_dict)
    return rule_dict

@router.get("/rules", response_model=List[AutomationRuleResponse])
async def list_rules(current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    cursor = db.automation_rules.find({"user_id": current_user["_id"]})
    return await cursor.to_list(length=100)

@router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str, current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    db = get_database()
    result = await db.automation_rules.delete_one({"_id": rule_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule deleted"}

# --- ANALYTICS DASHBOARD ---

@router.get("/stats")
async def get_industrial_stats(
    period: str = Query("30d", pattern="^(24h|7d|30d)$"),
    current_user: dict = Depends(get_current_user)
):
    check_pro(current_user)
    return await IndustrialService.get_usage_stats(current_user["_id"])

# --- BULK & PLAYGROUND ---

@router.post("/bulk", response_model=List[URLResponse])
async def bulk_shorten(urls_in: List[URLCreate], current_user: dict = Depends(get_current_user)):
    check_pro(current_user)
    if len(urls_in) > 100:
        raise HTTPException(status_code=400, detail="Bulk limit exceeded (max 100)")
    
    responses = []
    for url_in in urls_in:
        try:
            res = await shorten_url(url_in, current_user)
            responses.append(res)
        except Exception:
            continue
    return responses

@router.get("/docs")
async def get_api_documentation():
    """Returns documentation metadata for the frontend panel."""
    return {
        "endpoints": [
            {
                "method": "POST",
                "path": "/api/links",
                "desc": "Shorten a single URL",
                "headers": {"X-API-Key": "Required"},
                "example_req": {"original_url": "https://google.com"},
                "example_res": {"short_code": "abc12", "short_url": "..."}
            },
            {
                "method": "POST",
                "path": "/api/industrial/events",
                "desc": "Send custom events from external systems",
                "headers": {"X-API-Key": "Required"},
                "example_req": {"event_type": "conversion", "metadata": {"value": 50}}
            }
        ],
        "auth": "Include X-API-Key in your request headers for all Industrial endpoints."
    }
