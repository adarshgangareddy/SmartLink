from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis

from .config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None
    redis: redis.Redis = None

db_instance = Database()

async def connect_to_mongo():
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_instance.db = db_instance.client.smartlink
    try:
        db_instance.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
        # Ping to verify connection
        await db_instance.redis.ping()
        print("Connected to MongoDB and Redis")
    except Exception as e:
        db_instance.redis = None
        print(f"Warning: Redis connection failed ({e}). Rate limiting will be disabled.")
    
    print("Connected to MongoDB")

async def close_mongo_connection():
    db_instance.client.close()
    if db_instance.redis:
        await db_instance.redis.close()
    print("Closed MongoDB and Redis connections")

def get_database():
    return db_instance.db

def get_redis():
    return db_instance.redis
