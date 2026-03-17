import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///climbing.db")
    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://localhost:3000")

settings = Settings()
