import asyncio
import sys
import os

# Ensure the backend directory is in the path so we can import app
sys.path.append(os.getcwd())

from app.core.database import connect_to_mongo, get_database, close_mongo_connection

async def make_pro(email: str):
    await connect_to_mongo()
    db = get_database()
    
    # Update the user's is_pro flag and set their plan to 'pro'
    result = await db.users.update_one(
        {"email": email}, 
        {"$set": {"is_pro": True, "plan": "pro"}}
    )
    
    if result.modified_count:
        print(f"🎉 SUCCESS: User {email} is now a PRO member!")
    elif result.matched_count:
        print(f"ℹ️ NOTICE: User {email} was already a PRO member.")
    else:
        print(f"❌ ERROR: User with email '{email}' not found. Please check the spelling.")
        
    await close_mongo_connection()

if __name__ == "__main__":
    email = input("Enter the email address of the account you want to make PRO: ")
    asyncio.run(make_pro(email))
