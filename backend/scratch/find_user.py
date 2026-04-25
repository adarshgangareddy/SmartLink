import asyncio
from app.core.database import connect_to_mongo, get_database, close_mongo_connection

async def find_user():
    await connect_to_mongo()
    db = get_database()
    user = await db.users.find_one()
    if user:
        print(f"USER_EMAIL:{user['email']}")
        print(f"USER_PRO:{user.get('is_pro', False)}")
    else:
        print("No user found")
    await close_mongo_connection()

if __name__ == '__main__':
    asyncio.run(find_user())
