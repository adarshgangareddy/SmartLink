import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000"

async def run_test_suite():
    print("🚀 Starting Industrial Developer Platform Test Suite...")
    
    email = input("Enter your account email: ")
    password = input("Enter your password: ")

    async with httpx.AsyncClient() as client:
        # 1. Login to get JWT Token
        print("\n[1/4] Authenticating...")
        try:
            login_res = await client.post(f"{BASE_URL}/api/auth/login", data={
                "username": email,
                "password": password
            })
            if login_res.status_code != 200:
                print(f"❌ Login failed: {login_res.text}")
                return
            
            token = login_res.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Login successful.")
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return

        # 2. Generate an API Key
        print("\n[2/4] Generating Industrial API Key...")
        key_res = await client.post(
            f"{BASE_URL}/api/industrial/keys", 
            headers=headers,
            json={"name": "Automated Test Key", "permissions": ["read", "write"]}
        )
        
        if key_res.status_code != 200:
            print(f"❌ Failed to create key: {key_res.text}")
            print("💡 Reminder: Ensure your account is marked as PRO in the database.")
            return

        key_data = key_res.json()
        raw_key = key_data["key"]
        print(f"✅ Key Generated: {raw_key}")
        print(f"   Prefix: {key_data['key_prefix']} | Permissions: {key_data['permissions']}")

        # 3. Use API Key to Shorten a Link
        print("\n[3/4] Testing API Key usage (Shorten Link)...")
        api_headers = {"X-API-Key": raw_key}
        shorten_res = await client.post(
            f"{BASE_URL}/api/links/shorten",
            headers=api_headers,
            json={"original_url": "https://google.com", "custom_alias": f"test-{raw_key[:5]}"}
        )
        
        if shorten_res.status_code != 200:
            print(f"❌ API Key test failed: {shorten_res.text}")
        else:
            print(f"✅ Link Shortened Successfully: {shorten_res.json()['short_code']}")

        # 4. Check Industrial Stats
        print("\n[4/4] Fetching Real-Time Usage Stats...")
        stats_res = await client.get(f"{BASE_URL}/api/industrial/stats", headers=headers)
        
        if stats_res.status_code == 200:
            stats = stats_res.json()
            print(f"✅ Stats Retrieved: Total API Calls: {stats.get('total_requests', 0)}")
            print(f"   Top Endpoints: {json.dumps(stats.get('top_endpoints', []), indent=2)}")
        else:
            print(f"❌ Stats retrieval failed: {stats_res.text}")

    print("\n🏁 Test Suite Finished. Your developer platform is operational!")

if __name__ == "__main__":
    asyncio.run(run_test_suite())
