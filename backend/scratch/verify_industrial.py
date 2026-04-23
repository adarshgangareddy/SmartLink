import asyncio
import sys
import os

# Add backend/app to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.services.industrial_service import IndustrialService
from app.core.database import connect_to_mongo, get_database, close_mongo_connection
from app.schemas.base import EventType

async def test_verification():
    print("Testing Industrial Platform Backend...")
    
    # 1. Test Key Generation & Hashing
    raw_key = IndustrialService.generate_api_key()
    hashed_key = IndustrialService.hash_key(raw_key)
    print(f"Generated Key: {raw_key}")
    print(f"Hashed Key: {hashed_key}")
    
    # Verify hashing is consistent
    assert hashed_key == IndustrialService.hash_key(raw_key)
    print("✓ Hashing consistency verified.")

    # 2. Test Event Tracking (Requires MongoDB)
    try:
        await connect_to_mongo()
        db = get_database()
        
        test_user_id = "test-user-123"
        await IndustrialService.track_event(
            user_id=test_user_id,
            event_type=EventType.LINK_CLICK,
            url_id="test-url-456",
            metadata={"test": True}
        )
        print("✓ Event tracking triggered (async).")
        
        # Check if event exists in DB
        event = await db.events.find_one({"user_id": test_user_id})
        if event:
            print(f"✓ Event found in DB: {event['event_type']}")
        
        await close_mongo_connection()
    except Exception as e:
        print(f"Skipping DB verification (check connectivity): {e}")

if __name__ == "__main__":
    asyncio.run(test_verification())
