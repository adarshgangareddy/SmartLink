from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartLink"
    MONGODB_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # AWS SES Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_SES_FROM_EMAIL: Optional[str] = None

    # Razorpay Configuration
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PREFIX: str = "smartlink:"

    # OpenWeatherMap
    OPENWEATHERMAP_API_KEY: str = "78c33409b23fd856824fa4986ecbac36"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = "1042463500096-gk2q0sk2sdn5veea5gbh1ep3eh29so2n.apps.googleusercontent.com"

    class Config:
        env_file = ".env"

settings = Settings()
