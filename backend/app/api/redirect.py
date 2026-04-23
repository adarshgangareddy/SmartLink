import httpx
import random
import asyncio
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import RedirectResponse
from user_agents import parse
from ..core.database import get_database

router = APIRouter()

async def trigger_webhook(webhook_url: str, data: dict):
    if not webhook_url:
        return
    try:
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, json=data, timeout=2.0)
    except Exception:
        pass # Don't block the redirect if webhook fails

async def get_country_code(ip: str):
    # Fallback to a free API for demonstration, in production use Header or local DB
    if ip in ["127.0.0.1", "localhost"]:
        return "IN" # Mock local
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"https://ipapi.co/{ip}/json/", timeout=1.0)
            if res.status_code == 200:
                return res.json().get("country_code", "XX")
    except:
        pass
    return "XX"

@router.get("/{short_code}")
async def redirect_service(short_code: str, request: Request, pwd: str = Query(None)):
    db = get_database()
    url_data = await db.urls.find_one({"short_code": short_code})
    
    if not url_data:
        raise HTTPException(status_code=404, detail="Link not found")
    
    if not url_data.get("is_active", True):
        raise HTTPException(status_code=403, detail="This link has been deactivated")

    # Check Expiry
    if url_data.get("expiry_date"):
        if datetime.utcnow() > url_data["expiry_date"]:
            raise HTTPException(status_code=410, detail="Link has expired")
            
    # Check Max Clicks
    if url_data.get("max_clicks") and url_data["clicks"] >= url_data["max_clicks"]:
        raise HTTPException(status_code=410, detail="Maximum click limit reached for this link")

    # Check Password
    if url_data.get("password") and url_data["password"] != pwd:
        # In a real app we would render a password input page
        raise HTTPException(status_code=401, detail="Password required")

    # Capture Analytics
    user_agent_row = request.headers.get("user-agent", "")
    ua = parse(user_agent_row)
    client_ip = request.client.host
    
    # Try to get country code (Pro feature)
    country = "XX"
    if url_data.get("smart_redirect_geo"):
        country = await get_country_code(client_ip)

    analytics_entry = {
        "url_id": url_data["_id"],
        "timestamp": datetime.utcnow(),
        "device": "Mobile" if ua.is_mobile else "Tablet" if ua.is_tablet else "Desktop",
        "os_name": ua.os.family,
        "browser": ua.browser.family,
        "ip": client_ip,
        "location": country,
        "country_code": country
    }
    
    # Target URL selection logic
    target_url = url_data["original_url"]

    # 1. OS Routing
    os_routes = url_data.get("smart_redirect_os")
    if os_routes and ua.os.family in os_routes:
        target_url = os_routes[ua.os.family]

    # 2. Geo Routing
    geo_routes = url_data.get("smart_redirect_geo")
    if geo_routes and country in geo_routes:
        target_url = geo_routes[country]

    # 3. A/B Rotator (Calculated if present)
    ab_targets = url_data.get("ab_targets")
    if ab_targets and len(ab_targets) > 0:
        # Simple weighted selection
        # ab_targets: [ { "url": "...", "weight": 50 }, ... ]
        # Combine original with AB targets
        all_targets = [{"url": url_data["original_url"], "weight": 100}] # Default 100
        # If weights are provided, we should use them. For now, let's just do random if no weights.
        all_targets = ab_targets + [{"url": url_data["original_url"], "weight": 0}] # Original as fallback if total weight < 100
        
        choices = [t["url"] for t in ab_targets] + [url_data["original_url"]]
        # Simplest: random choice for now, or weighted if user provided
        weights = [t.get("weight", 10) for t in ab_targets]
        total_weight = sum(weights)
        if total_weight < 100:
             choices.append(url_data["original_url"])
             weights.append(100 - total_weight)
        
        target_url = random.choices(choices, weights=weights, k=1)[0]

    # Update counts and trigger events through Industrial Service
    await db.urls.update_one({"_id": url_data["_id"]}, {"$inc": {"clicks": 1}})
    
    from ..services.industrial_service import IndustrialService
    from ..schemas.base import EventType
    
    # Fire event (handles webhooks and automation rules)
    asyncio.create_task(IndustrialService.track_event(
        user_id=url_data["user_id"],
        event_type=EventType.LINK_CLICK,
        url_id=url_data["_id"],
        device=analytics_entry["device"],
        os=analytics_entry["os_name"],
        location=country,
        metadata={
            "short_code": short_code,
            "browser": analytics_entry["browser"],
            "ip": analytics_entry["ip"]
        }
    ))

    # Old legacy webhook (if still present in url_data)
    if url_data.get("webhook_url"):
        # We could still trigger this for backward compatibility or migration
        pass

    # Handle Splash Screen
    if url_data.get("show_splash_screen"):
        from ..core.config import settings
        import urllib.parse
        logo = url_data.get("splash_logo_url", "")
        # Redirect to a frontend splash page
        splash_url = f"{settings.FRONTEND_URL}/splash/{short_code}?target={urllib.parse.quote(target_url)}&logo={urllib.parse.quote(logo)}"
        return RedirectResponse(url=splash_url)

    return RedirectResponse(url=target_url)
