"""
Configuration settings for SatQuery-AI backend
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # App info
    app_name: str = "SatQuery-AI"
    app_version: str = "1.0.0"
    debug: bool = True

    # CORS settings
    cors_origins: list = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:3000",
        "*",
    ]
    cors_credentials: bool = True
    cors_methods: list = ["*"]
    cors_headers: list = ["*"]

    # API settings
    api_prefix: str = "/api"

    # Gemini API key for Sid's query router
    gemini_api_key: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
