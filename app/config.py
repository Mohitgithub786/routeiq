import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Production application settings loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "RouteIQ — Intelligent MCP Agent Dispatcher"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "production"
    DEBUG: bool = False
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    
    # LLM Settings
    OPENAI_API_KEY: Optional[str] = None
    ROUTER_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.1
    
    # Resilience & MCP Settings
    MCP_TIMEOUT_SECONDS: float = 10.0
    MAX_TOOL_RETRIES: int = 2
    CIRCUIT_BREAKER_THRESHOLD: int = 3
    
    # Telemetry
    ENABLE_METRICS: bool = True


settings = Settings()
