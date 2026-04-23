from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import connect_to_mongo, close_mongo_connection
from .core.middleware import RateLimitMiddleware
from .api import auth, urls, redirect, payments, industrial

app = FastAPI(title=settings.PROJECT_NAME)

# Middleware configuration
app.add_middleware(RateLimitMiddleware, requests_per_minute=30)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include API routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(urls.router, prefix="/api/links", tags=["links"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(industrial.router, prefix="/api/industrial", tags=["industrial"])
app.include_router(redirect.router, tags=["redirect"])

@app.get("/")
async def root():
    return {"message": "Welcome to SmartLink API"}
