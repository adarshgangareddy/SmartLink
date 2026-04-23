from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from ..core.database import get_database
from ..core.config import settings
from ..schemas.base import URLCreate, URLResponse
from .auth import get_current_user
from datetime import datetime
import string
import random
import uuid
import qrcode
import io
import base64

router = APIRouter()

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def generate_qr_code(url: str):
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

@router.post("/shorten", response_model=URLResponse)
async def shorten_url(url_in: URLCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    if url_in.custom_alias:
        existing = await db.urls.find_one({"short_code": url_in.custom_alias})
        if existing:
            raise HTTPException(status_code=400, detail="Custom alias already in use")
        short_code = url_in.custom_alias
    else:
        short_code = generate_short_code()
        # Verify uniqueness
        while await db.urls.find_one({"short_code": short_code}):
            short_code = generate_short_code()
            
    url_id = str(uuid.uuid4())
    url_dict = {
        "_id": url_id,
        "original_url": url_in.original_url,
        "short_code": short_code,
        "user_id": current_user["_id"],
        "clicks": 0,
        "created_at": datetime.utcnow(),
        "expiry_date": url_in.expiry_date,
        "password": url_in.password,
    }

    # Add Pro features if applicable
    if current_user.get("is_pro"):
        url_dict.update({
            "webhook_url": url_in.webhook_url,
            "smart_redirect_geo": url_in.smart_redirect_geo,
            "smart_redirect_os": url_in.smart_redirect_os,
            "show_splash_screen": url_in.show_splash_screen,
            "splash_logo_url": url_in.splash_logo_url,
            "retargeting_pixels": url_in.retargeting_pixels,
            "max_clicks": url_in.max_clicks,
            "ab_targets": url_in.ab_targets,
            "qr_style": url_in.qr_style
        })
    
    await db.urls.insert_one(url_dict)
    
    # Return response
    return {
        **url_dict,
        "qr_code": generate_qr_code(f"{settings.BASE_URL}/{short_code}")
    }

@router.get("/user/links", response_model=list[URLResponse])
async def get_user_links(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.urls.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    links = await cursor.to_list(length=100)
    return links

@router.delete("/link/{url_id}")
async def delete_link(url_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.urls.delete_one({"_id": url_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"message": "Link deleted successfully"}

@router.get("/analytics/all")
async def get_all_analytics(current_user: dict = Depends(get_current_user)):
    db = get_database()
    # 1. Get all url IDs for the user
    user_urls = await db.urls.find({"user_id": current_user["_id"]}, {"_id": 1}).to_list(length=1000)
    url_ids = [str(url["_id"]) for url in user_urls]
    
    if not url_ids:
        return {"clickData": [], "deviceData": []}

    # 2. Fetch all analytics matching those url IDs
    analytics_cursor = db.analytics.find({"url_id": {"$in": url_ids}})
    records = await analytics_cursor.to_list(length=5000)

    # 3. Aggregate device data
    device_counts = {"Desktop": 0, "Mobile": 0, "Tablet": 0}
    
    # Aggregate clicks by Day (format 'Mon', 'Tue' etc. or date)
    from collections import defaultdict
    day_counts = defaultdict(int)
    
    for r in records:
        device = r.get("device", "Desktop")
        if device in device_counts:
            device_counts[device] += 1
            
        dt: datetime = r.get("timestamp")
        if dt:
            day_str = dt.strftime("%a") # 'Mon', 'Tue'
            day_counts[day_str] += 1

    # Format exactly how Recharts expects it
    deviceData = [{"name": k, "value": v} for k, v in device_counts.items() if v > 0]
    
    # To keep chart ordering logical, let's just make sure days present have values
    clickData = [{"name": day, "clicks": clicks} for day, clicks in day_counts.items()]

    return {
        "clickData": clickData,
        "deviceData": deviceData
    }
