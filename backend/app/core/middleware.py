from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time
from ..core.database import get_redis, get_database
from ..core.config import settings

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.default_limit = requests_per_minute

    async def dispatch(self, request: Request, call_next):
        # Only rate limit API calls
        if not request.url.path.startswith("/api"):
            return await call_next(request)

        # Skip rate limit for redirect base path if it doesn't have /api prefix
        # (Though in main.py it's included without prefix)
        
        redis = get_redis()
        if not redis:
            # Fallback if Redis is down (in production, log warning)
            return await call_next(request)

        # 1. Identity & Plan Selection
        api_key = request.headers.get("X-API-Key")
        user = getattr(request.state, "user", None) # In case auth middleware ran before
        
        identifier = api_key or request.client.host
        limit = self.default_limit

        # If it's an API Key, we already handled validation in auth.py Depends()
        # But Middleware runs before Depends in the FastAPI stack usually.
        # To handle this properly, we should re-check or move limits to routes.
        # However, for a generic middleware, let's look up the key again or use a cache.
        
        if api_key:
            # Check Redis cache for key policy
            cache_key = f"{settings.REDIS_PREFIX}key_policy:{api_key[:10]}"
            cached_limit = await redis.get(cache_key)
            if cached_limit:
                limit = int(cached_limit)
            else:
                db = get_database()
                from ..services.industrial_service import IndustrialService
                hashed = IndustrialService.hash_key(api_key)
                key_data = await db.api_keys.find_one({"hashed_key": hashed})
                if key_data:
                    limit = key_data.get("rate_limit_override", 300)
                    await redis.setex(cache_key, 300, limit) # Cache for 5 mins
                else:
                    raise HTTPException(status_code=403, detail="Invalid API Key")
        elif user:
            limit = 100 if user.get("is_pro") else 10

        # 2. Redis-based Fixed Window Rate Limiting
        try:
            current_minute = int(time.time() / 60)
            key = f"{settings.REDIS_PREFIX}ratelimit:{identifier}:{current_minute}"
            
            count = await redis.incr(key)
            if count == 1:
                await redis.expire(key, 60)
                
            if count > limit:
                raise HTTPException(
                    status_code=429, 
                    detail=f"Rate limit exceeded. Limit: {limit} requests/min."
                )
        except HTTPException:
            raise
        except Exception as e:
            # Log error and bypass rate limit if Redis fails during operation
            print(f"Rate Limiting Error: {e}")
            pass

        response = await call_next(request)
        return response
