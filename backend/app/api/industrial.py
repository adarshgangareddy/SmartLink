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
    if not user or not user.get("is_pro"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SmartLink Pro is required to access Industrial modules."
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
    Returns live data for the dashboard. 
    If a real hardware device has sent data recently, it returns real data.
    Otherwise, it falls back to randomized simulation data.
    """
    db = get_database()
    
    # Check for the latest REAL event from your ESP32 in the database
    latest_real_event = await db.device_events.find_one(
        {"device_id": device_id}, 
        sort=[("timestamp", -1)]
    )
    
    # Get current pump state from memory
    pump_status = SIMULATED_DEVICES.get(device_id, "OFF")
    
    # If a real device sent data in the last 30 seconds, use that real data!
    if latest_real_event and (datetime.utcnow() - latest_real_event["timestamp"]).total_seconds() < 30:
        real_data = latest_real_event["data"]
        return {
            "moisture": real_data.get("moisture"),
            "temperature": real_data.get("temp"),
            "humidity": real_data.get("humidity", 50),
            "pump": pump_status,
            "mode": "REAL",
            "timestamp": latest_real_event["timestamp"].isoformat()
        }
    
    # Fallback to pure simulation if no hardware is connected
    return {
        "moisture": random.randint(20, 80),
        "temperature": random.randint(25, 35),
        "humidity": random.randint(40, 90),
        "pump": pump_status,
        "mode": "SIMULATED",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/devices/{device_id}/control")
async def control_simulated_device(device_id: str, payload: Dict[str, str]):
    """
    Updates the pump status in memory for simulation testing,
    AND queues a command for real hardware devices to fetch.
    """
    db = get_database()
    new_status = payload.get("pump")
    if new_status not in ["ON", "OFF"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid status. Use 'ON' or 'OFF'."
        )
    
    # 1. Update the in-memory state (for the Dashboard UI)
    SIMULATED_DEVICES[device_id] = new_status
    
    # 2. Queue a real command for the physical ESP32 hardware
    # This allows the "Manual Toggle" button to control real motors
    command_dict = {
        "device_id": device_id,
        "command": {"pump": new_status.lower()},
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    await db.device_commands.insert_one(command_dict)
    
    return {
        "status": "success",
        "device_id": device_id,
        "pump": new_status,
        "hardware_queued": True
    }


# --- OPENWEATHERMAP WEATHER ENDPOINT ---

@router.get("/weather")
async def get_weather_data(
    city: str = Query("Bengaluru", description="City name"),
    lat: Optional[float] = Query(None, description="Latitude (overrides city)"),
    lon: Optional[float] = Query(None, description="Longitude (overrides city)")
):
    """
    Returns live weather data from OpenWeatherMap:
    temperature, humidity, rainfall, air pollution index (AQI).
    """
    import httpx
    from ..core.config import settings
    
    api_key = settings.OPENWEATHERMAP_API_KEY
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # 1. Current weather
            if lat is not None and lon is not None:
                weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            else:
                weather_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
            
            weather_resp = await client.get(weather_url)
            if weather_resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Weather API error: {weather_resp.text}")
            
            weather_data = weather_resp.json()
            coord_lat = weather_data["coord"]["lat"]
            coord_lon = weather_data["coord"]["lon"]
            
            # 2. Air Pollution (uses coordinates)
            pollution_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={coord_lat}&lon={coord_lon}&appid={api_key}"
            pollution_resp = await client.get(pollution_url)
            pollution_data = pollution_resp.json() if pollution_resp.status_code == 200 else {}
            
            # 3. Forecast for rainfall prediction
            forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={coord_lat}&lon={coord_lon}&appid={api_key}&units=metric&cnt=8"
            forecast_resp = await client.get(forecast_url)
            forecast_data = forecast_resp.json() if forecast_resp.status_code == 200 else {}
        
        # Extract weather values
        main = weather_data.get("main", {})
        wind = weather_data.get("wind", {})
        weather_desc = weather_data.get("weather", [{}])[0]
        rain = weather_data.get("rain", {})
        
        # AQI from pollution data
        aqi_index = 0
        components = {}
        if pollution_data.get("list"):
            aqi_index = pollution_data["list"][0]["main"]["aqi"]
            components = pollution_data["list"][0].get("components", {})
        
        aqi_labels = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}
        
        # Rainfall from current + forecast
        rainfall_1h = rain.get("1h", 0)
        forecast_rain = 0
        if forecast_data.get("list"):
            for slot in forecast_data["list"][:4]:
                forecast_rain += slot.get("rain", {}).get("3h", 0)
        
        return {
            "city": weather_data.get("name", city),
            "country": weather_data.get("sys", {}).get("country", ""),
            "coord": {"lat": coord_lat, "lon": coord_lon},
            "temperature": round(main.get("temp", 0), 1),
            "feels_like": round(main.get("feels_like", 0), 1),
            "temp_min": round(main.get("temp_min", 0), 1),
            "temp_max": round(main.get("temp_max", 0), 1),
            "humidity": main.get("humidity", 0),
            "pressure": main.get("pressure", 0),
            "visibility": weather_data.get("visibility", 0),
            "wind_speed": wind.get("speed", 0),
            "wind_direction": wind.get("deg", 0),
            "weather_condition": weather_desc.get("main", "Clear"),
            "weather_description": weather_desc.get("description", "").title(),
            "weather_icon": weather_desc.get("icon", "01d"),
            "clouds": weather_data.get("clouds", {}).get("all", 0),
            "rainfall_1h_mm": rainfall_1h,
            "rainfall_forecast_12h_mm": round(forecast_rain, 1),
            "aqi": aqi_index,
            "aqi_label": aqi_labels.get(aqi_index, "Unknown"),
            "pm2_5": round(components.get("pm2_5", 0), 1),
            "pm10": round(components.get("pm10", 0), 1),
            "co": round(components.get("co", 0), 1),
            "no2": round(components.get("no2", 0), 1),
            "o3": round(components.get("o3", 0), 1),
            "sunrise": weather_data.get("sys", {}).get("sunrise"),
            "sunset": weather_data.get("sys", {}).get("sunset"),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "OpenWeatherMap Live Data"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather fetch failed: {str(e)}")


# --- EXTENDED API DOCUMENTATION ---

@router.get("/docs/full")
async def get_full_api_documentation():
    """Returns complete documentation for all Industrial API endpoints."""
    return {
        "version": "2.0",
        "base_url": "http://localhost:8000",
        "auth": {
            "method": "API Key",
            "header": "X-API-Key: <your_key>",
            "description": "Include your API key in every request header. Generate keys in the Industrial Suite → API Keys tab."
        },
        "endpoints": [
            {
                "method": "POST", "path": "/api/links/shorten",
                "desc": "Shorten a single URL",
                "headers": {"X-API-Key": "Required"},
                "body": {"original_url": "https://your-long-url.com", "custom_alias": "optional", "expiry_date": "optional ISO datetime"},
                "response": {"short_code": "abc12", "short_url": "http://localhost:8000/abc12", "qr_code": "base64..."}
            },
            {
                "method": "POST", "path": "/api/industrial/bulk",
                "desc": "Bulk shorten up to 100 URLs at once",
                "headers": {"X-API-Key": "Required"},
                "body": [{"original_url": "https://example.com"}, {"original_url": "https://example2.com"}],
                "response": [{"short_code": "abc12"}, {"short_code": "def34"}]
            },
            {
                "method": "POST", "path": "/api/industrial/devices/{device_id}/events",
                "desc": "Send sensor data from IoT device (ESP32, Arduino, etc.)",
                "headers": {"X-API-Key": "Required"},
                "body": {"moisture": 45, "temp": 28.5, "humidity": 65, "light": 800},
                "response": {"status": "recorded", "timestamp": "2026-05-02T..."}
            },
            {
                "method": "GET", "path": "/api/industrial/devices/{device_id}/commands/next",
                "desc": "Poll for the next pending command (for hardware devices)",
                "headers": {"X-API-Key": "Required"},
                "response": {"command_id": "...", "command": {"pump": "on"}, "timestamp": "..."}
            },
            {
                "method": "GET", "path": "/api/industrial/weather",
                "desc": "Get live weather data (temperature, humidity, AQI, rainfall)",
                "query_params": {"city": "Bengaluru", "lat": "12.97", "lon": "77.59"},
                "response": {"temperature": 28.5, "humidity": 65, "aqi": 2, "aqi_label": "Fair", "rainfall_1h_mm": 0}
            },
            {
                "method": "GET", "path": "/api/industrial/stats",
                "desc": "Industrial analytics — API request volume, top endpoints",
                "headers": {"Authorization": "Bearer <token>"},
                "response": {"total_requests": 450, "requests_by_day": [], "top_endpoints": []}
            },
            {
                "method": "POST", "path": "/api/industrial/webhooks",
                "desc": "Register a webhook to receive real-time event notifications",
                "body": {"url": "https://your-server.com/hook", "events": ["link_click", "scan", "api_call"]},
                "response": {"_id": "abc123", "url": "https://your-server.com/hook", "events": ["link_click"]}
            },
            {
                "method": "POST", "path": "/api/industrial/rules",
                "desc": "Create an automation rule (If-This-Then-That)",
                "body": {
                    "name": "Alert on India Click",
                    "event_type": "link_click",
                    "condition": {"field": "location", "operator": "==", "value": "IN"},
                    "action": "trigger_webhook",
                    "action_target": "<webhook_id>"
                }
            }
        ],
        "arduino_example": {
            "description": "ESP32 code to send sensor data every 30 seconds",
            "code": """
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASS";
const char* apiKey = "YOUR_API_KEY";
const char* deviceId = "YOUR_DEVICE_ID";
const char* serverUrl = "http://localhost:8000/api/industrial/devices/";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(1000);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(serverUrl) + deviceId + "/events";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", apiKey);
    
    float moisture = analogRead(34) / 40.96; // 0-100%
    float temp = 28.5; // Replace with real sensor
    
    String body = "{\\"moisture\\":" + String(moisture) + ",\\"temp\\":" + String(temp) + "}";
    int code = http.POST(body);
    http.end();
  }
  delay(30000);
}
"""
        }
    }

