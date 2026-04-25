import asyncio
import uuid
from datetime import datetime, timedelta
import random
from app.core.database import connect_to_mongo, get_database, close_mongo_connection

async def seed_data(email: str):
    await connect_to_mongo()
    db = get_database()
    
    user = await db.users.find_one({"email": email})
    if not user:
        print(f"User {email} not found")
        return

    # 1. Create an API Key if none exists
    api_key = await db.api_keys.find_one({"user_id": user["_id"]})
    if not api_key:
        api_key_id = str(uuid.uuid4())
        await db.api_keys.insert_one({
            "_id": api_key_id,
            "name": "IoT Master Key",
            "user_id": user["_id"],
            "key_prefix": "sl_test",
            "hashed_key": "dummy_hash",
            "permissions": ["admin"],
            "rate_limit_override": 1000,
            "status": "active",
            "created_at": datetime.utcnow()
        })
        api_key_id = api_key_id
    else:
        api_key_id = api_key["_id"]

    # 2. Create the Irrigation Device
    device_id = str(uuid.uuid4())
    device = {
        "_id": device_id,
        "name": "Smart Garden #1",
        "user_id": user["_id"],
        "api_key_id": api_key_id,
        "status": "active",
        "metadata": {
            "type": "irrigation",
            "pump_status": "off",
            "location": "Front Porch"
        },
        "usage_stats": {"api_calls": 100},
        "created_at": datetime.utcnow() - timedelta(days=7),
        "last_active": datetime.utcnow()
    }
    await db.devices.insert_one(device)

    # 3. Seed moisture events for the last 2 hours
    events = []
    base_moisture = 45
    for i in range(24):
        timestamp = datetime.utcnow() - timedelta(minutes=i*5)
        moisture = base_moisture + random.randint(-5, 5)
        temp = 25 + random.randint(0, 5)
        events.append({
            "device_id": device_id,
            "user_id": user["_id"],
            "timestamp": timestamp,
            "data": {
                "moisture": moisture,
                "temp": temp
            }
        })
    
    if events:
        await db.device_events.insert_many(events)
        print(f"Successfully seeded {len(events)} events for device {device_id}")

    await close_mongo_connection()

if __name__ == '__main__':
    asyncio.run(seed_data("adarshavg26@gmail.com"))
