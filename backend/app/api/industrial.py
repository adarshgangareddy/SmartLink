from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from typing import List, Optional, Dict, Any
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
import random

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

@router.put("/devices/{device_id}")
async def update_device(
    device_id: str,
    update_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    check_pro(current_user)
    db = get_database()
    
    # Verify device
    device = await db.devices.find_one({"_id": device_id, "user_id": current_user["_id"]})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    await db.devices.update_one(
        {"_id": device_id},
        {"$set": {"metadata": update_data.get("metadata", device.get("metadata", {}))}}
    )
    return {"status": "updated"}

@router.post("/devices/{device_id}/events")

async def log_device_event(
    device_id: str, 
    payload: Dict[str, Any], 
    current_user: dict = Depends(get_current_user)
):
    check_pro(current_user)
    db = get_database()
    
    # Verify device belongs to user
    device = await db.devices.find_one({"_id": device_id, "user_id": current_user["_id"]})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    event_dict = {
        "device_id": device_id,
        "user_id": current_user["_id"],
        "timestamp": datetime.utcnow(),
        "data": payload
    }
    await db.device_events.insert_one(event_dict)
    
    # Update device last active
    await db.devices.update_one(
        {"_id": device_id},
        {"$set": {"last_active": datetime.utcnow()}, "$inc": {"usage_stats.api_calls": 1}}
    )
    
    # Check for automations
    # (Existing evaluate_rules could be adapted here if needed)
    
    return {"status": "recorded", "timestamp": event_dict["timestamp"]}

@router.get("/devices/{device_id}/events")
async def get_device_events(
    device_id: str, 
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    check_pro(current_user)
    db = get_database()
    
    # Verify device
    device = await db.devices.find_one({"_id": device_id, "user_id": current_user["_id"]})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    cursor = db.device_events.find({"device_id": device_id}).sort("timestamp", -1).limit(limit)
    return await cursor.to_list(length=limit)

@router.post("/devices/{device_id}/command")
async def send_device_command(
    device_id: str,
    command: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    check_pro(current_user)
    db = get_database()
    
    # Verify device
    device = await db.devices.find_one({"_id": device_id, "user_id": current_user["_id"]})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    # In a real system, this would be pushed via MQTT or WebSocket
    # For this demo, we store it as a "pending command" that the device can poll for
    command_dict = {
        "device_id": device_id,
        "user_id": current_user["_id"],
        "command": command,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    await db.device_commands.insert_one(command_dict)
    
    # Also update device metadata to reflect current desired state
    if "pump" in command:
        await db.devices.update_one(
            {"_id": device_id},
            {"$set": {"metadata.pump_status": command["pump"]}}
        )
        
    return {"status": "command_sent", "command_id": str(command_dict["_id"])}

@router.get("/devices/{device_id}/commands/next")
async def get_next_device_command(
    device_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_pro(current_user)
    db = get_database()
    
    # Verify device
    device = await db.devices.find_one({"_id": device_id, "user_id": current_user["_id"]})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    # Find oldest pending command
    command = await db.device_commands.find_one_and_update(
        {"device_id": device_id, "status": "pending"},
        {"$set": {"status": "delivered", "delivered_at": datetime.utcnow()}},
        sort=[("created_at", 1)]
    )
    
    if not command:
        return {"status": "no_commands"}
        
    return {
        "command_id": str(command["_id"]),
        "command": command["command"],
        "timestamp": command["created_at"]
    }


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

# --- IN-MEMORY SIMULATION STORAGE ---
# Stores pump status for each device ID: { "device_id": "OFF" }
SIMULATED_DEVICES: Dict[str, str] = {}

# --- SIMULATION ENDPOINTS (Hardware-Free) ---

@router.get("/devices/{device_id}/data")
async def get_simulated_data(device_id: str):
    """
    Simulates real-time sensor data for testing without hardware.
    Returns random moisture/temp and the current stored pump state.
    """
    # Get current pump state from memory, default to OFF if never set
    pump_status = SIMULATED_DEVICES.get(device_id, "OFF")
    
    return {
        "moisture": random.randint(20, 80),
        "temperature": random.randint(25, 35),
        "pump": pump_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/devices/{device_id}/control")
async def control_simulated_device(device_id: str, payload: Dict[str, str]):
    """
    Updates the pump status in memory for simulation testing.
    Accepts: { "pump": "ON" } or { "pump": "OFF" }
    """
    new_status = payload.get("pump")
    if new_status not in ["ON", "OFF"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid status. Use 'ON' or 'OFF'."
        )
    
    # Update the in-memory state
    SIMULATED_DEVICES[device_id] = new_status
    
    return {
        "status": "success",
        "device_id": device_id,
        "pump": new_status
    }
