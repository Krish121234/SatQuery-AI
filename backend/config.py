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
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]
    cors_credentials: bool = True
    cors_methods: list = ["*"]
    cors_headers: list = ["*"]

    # API settings
    api_prefix: str = "/api"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
