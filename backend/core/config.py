"""
core/config.py
--------------
Centralised settings loaded from the .env file via pydantic-settings.

Usage
-----
    from core.config import settings

    print(settings.MONGO_URI)
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # MongoDB
    # ------------------------------------------------------------------
    MONGO_URI: str = Field(
        default="mongodb://localhost:27017",
        description="Full MongoDB connection URI.",
    )
    MONGO_DB_NAME: str = Field(
        default="qiti_db",
        description="Name of the primary MongoDB database.",
    )
    MONGO_SESSIONS_COLLECTION: str = Field(
        default="sessions",
        description="Collection that stores learning session documents.",
    )

    # ------------------------------------------------------------------
    # Qdrant
    # ------------------------------------------------------------------
    QDRANT_HOST: str = Field(default="localhost", description="Qdrant server host.")
    QDRANT_PORT: int = Field(default=6333, description="Qdrant gRPC / REST port.")
    QDRANT_API_KEY: str | None = Field(
        default=None, description="Optional Qdrant Cloud API key."
    )
    QDRANT_COLLECTION_NAME: str = Field(
        default="knowledge_base",
        description="Default Qdrant collection for RAG retrieval.",
    )

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="Allowed CORS origins for the frontend.",
    )

    # ------------------------------------------------------------------
    # ML / LLM
    # ------------------------------------------------------------------
    OPENAI_API_KEY: str | None = Field(
        default=None, description="OpenAI API key for LLM calls."
    )
    GOOGLE_API_KEY: str | None = Field(
        default=None, description="Google Gemini API key."
    )

    # ------------------------------------------------------------------
    # General
    # ------------------------------------------------------------------
    DEBUG: bool = Field(default=False, description="Enable debug mode.")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level.")


# Singleton instance – import this everywhere
settings = Settings()
