import asyncio
import os
import sys

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from app.core.database import get_database

async def check():
    db = get_database()
    user = await db.users.find_one({'email': 'adarshavg26@gmail.com'})
    print(user)

if __name__ == "__main__":
    asyncio.run(check())
