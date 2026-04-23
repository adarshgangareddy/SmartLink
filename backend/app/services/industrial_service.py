import hashlib
import secrets
import hmac
import httpx
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from ..core.database import get_database, get_redis
from ..schemas.base import EventType, APIKeyPermission

class IndustrialService:
    @staticmethod
    def hash_key(key: str) -> str:
        """Returns a SHA256 hash of the API key."""
        return hashlib.sha256(key.encode()).hexdigest()

    @staticmethod
    def generate_api_key() -> str:
        """Generates a secure random API key."""
        return f"sl_{secrets.token_urlsafe(32)}"

    @staticmethod
    async def track_event(
        user_id: str,
        event_type: EventType,
        url_id: Optional[str] = None,
        device: str = "Unknown",
        os: str = "Unknown",
        location: str = "Unknown",
        metadata: Dict[str, Any] = {}
    ):
        """Logs an event and triggers automation/webhooks."""
        db = get_database()
        event_dict = {
            "user_id": user_id,
            "event_type": event_type,
            "url_id": url_id,
            "device": device,
            "os": os,
            "location": location,
            "timestamp": datetime.utcnow(),
            "metadata": metadata
        }
        await db.events.insert_one(event_dict)
        
        # Trigger automation check (async)
        asyncio.create_task(IndustrialService.evaluate_rules(user_id, event_type, event_dict))
        
        # Trigger webhooks (async)
        asyncio.create_task(IndustrialService.dispatch_webhooks(user_id, event_type, event_dict))

    @staticmethod
    async def dispatch_webhooks(user_id: str, event_type: EventType, payload: Dict[str, Any]):
        """Finds active webhooks for a user/event and sends them."""
        db = get_database()
        cursor = db.webhooks.find({"user_id": user_id, "events": event_type, "is_active": True})
        webhooks = await cursor.to_list(length=100)
        
        for wh in webhooks:
            asyncio.create_task(IndustrialService.send_webhook_request(wh, payload))

    @staticmethod
    async def send_webhook_request(webhook: Dict[str, Any], payload: Dict[str, Any], attempt: int = 1):
        """Sends a POST request to a webhook URL with retries."""
        url = webhook["url"]
        secret = webhook.get("secret")
        
        headers = {"Content-Type": "application/json"}
        if secret:
            # Add signature for security
            signature = hmac.new(secret.encode(), str(payload).encode(), hashlib.sha256).hexdigest()
            headers["X-SmartLink-Signature"] = signature
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, timeout=5.0)
                status = "success" if 200 <= response.status_code < 300 else "failed"
                code = response.status_code
        except Exception as e:
            status = "failed"
            code = 500
            
        # Log the attempt
        db = get_database()
        await db.webhook_logs.insert_one({
            "webhook_id": webhook["_id"],
            "event_type": payload["event_type"],
            "payload": payload,
            "status": status,
            "response_code": code,
            "attempts": attempt,
            "timestamp": datetime.utcnow()
        })
        
        # Retry logic (up to 3 attempts with backoff)
        if status == "failed" and attempt < 3:
            wait_time = attempt * 5 # 5s, 10s backoff
            await asyncio.sleep(wait_time)
            await IndustrialService.send_webhook_request(webhook, payload, attempt + 1)

    @staticmethod
    async def evaluate_rules(user_id: str, event_type: EventType, event_data: Dict[str, Any]):
        """Evaluates automation rules for a given event."""
        db = get_database()
        cursor = db.automation_rules.find({"user_id": user_id, "event_type": event_type, "is_active": True})
        rules = await cursor.to_list(length=100)
        
        for rule in rules:
            condition = rule["condition"]
            # Simplified condition evaluation
            # condition: {"field": "location", "operator": "==", "value": "US"}
            field = condition.get("field")
            operator = condition.get("operator")
            value = condition.get("value")
            
            actual_value = event_data.get(field)
            if not actual_value and field in event_data.get("metadata", {}):
                actual_value = event_data["metadata"].get(field)
                
            triggered = False
            if operator == "==":
                triggered = actual_value == value
            elif operator == ">":
                triggered = float(actual_value) > float(value)
            elif operator == "<":
                triggered = float(actual_value) < float(value)
            # Add more operators as needed
            
            if triggered:
                # Execute action
                action = rule["action"]
                target = rule["action_target"]
                
                if action == "trigger_webhook":
                    # target is webhook_id
                    wh = await db.webhooks.find_one({"_id": target})
                    if wh:
                        asyncio.create_task(IndustrialService.send_webhook_request(wh, event_data))
                elif action == "redirect_url":
                    # This would need to be handled during the request cycle if it's a synchronous rule
                    # For now, automation rules are async.
                    pass

    @staticmethod
    async def get_usage_stats(user_id: str, days: int = 30) -> Dict[str, Any]:
        """Aggregates real API usage stats for a user using MongoDB aggregation."""
        db = get_database()
        from datetime import timedelta
        since = datetime.utcnow() - timedelta(days=days)

        # 1. Pipeline for daily requests
        pipeline_daily = [
            {"$match": {"user_id": user_id, "timestamp": {"$gte": since}, "event_type": "api_call"}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        daily_res = await db.events.aggregate(pipeline_daily).to_list(length=days)
        requests_by_day = [{"date": d["_id"], "reqs": d["count"]} for d in daily_res]

        # 2. Pipeline for top endpoints
        pipeline_endpoints = [
            {"$match": {"user_id": user_id, "event_type": "api_call"}},
            {"$group": {
                "_id": "$metadata.path",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        endpoint_res = await db.events.aggregate(pipeline_endpoints).to_list(length=5)
        top_endpoints = [{"path": e["_id"] or "Unknown", "count": e["count"]} for e in endpoint_res]

        return {
            "total_requests": await db.events.count_documents({"user_id": user_id, "event_type": "api_call"}),
            "requests_by_day": requests_by_day,
            "error_rate": 0.0, # This can be calculated from webhook failure logs or API errors
            "top_endpoints": top_endpoints
        }
