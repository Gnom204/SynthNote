from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "SynthNote API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    DATABASE_URL: str
    # Sync DB URL is required for Celery workers (which use sync SQLAlchemy)
    DATABASE_URL_SYNC: str | None = None

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8081",
        "exp://localhost:8081",
    ]
    CORS_ORIGINS_REGEX: str = (
        r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|exp://.|https://..your-domain.com)$"
    )
    CORS_ALLOW_CREDENTIALS: bool = True

    ENVIRONMENT: Literal["development", "staging", "production"] = "development"

    # ----- AI / Gemini -----
    # Get an API key at https://aistudio.google.com/app/apikey
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    # Optional Cloudflare Worker proxy URL for accessing Gemini from restricted regions.
    # Example: https://your-worker.workers.dev/v1beta
    # If empty, the default Google endpoint is used.
    GEMINI_PROXY_URL: str = ""
    GEMINI_REQUEST_TIMEOUT: int = 120

    # ----- Celery / RabbitMQ -----
    CELERY_BROKER_URL: str = "amqp://guest:guest@rabbitmq:5672//"
    CELERY_RESULT_BACKEND: str = "rpc://"
    CELERY_TASK_TIME_LIMIT: int = 60 * 10  # 10 minutes hard limit
    CELERY_TASK_SOFT_TIME_LIMIT: int = 60 * 8

    # ----- File storage -----
    UPLOAD_DIR: str = "/app/uploads"
    MAX_PDF_SIZE_MB: int = 50

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL_SYNC:
            return self.DATABASE_URL_SYNC
        # Convert async URL to sync URL by stripping the +asyncpg driver suffix.
        return self.DATABASE_URL.replace("+asyncpg", "+psycopg2").replace(
            "postgresql+psycopg2", "postgresql+psycopg2"
        )


settings = Settings()
