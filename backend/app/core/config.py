import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "LeadIQ — AI Sales Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database URL (Supports Supabase / PostgreSQL / MySQL / SQLite directly)
    DATABASE_URL: Optional[str] = Field(default=None)

    # MySQL Configuration
    DB_HOST: str = Field(default="localhost")
    DB_PORT: int = Field(default=3306)
    DB_USER: str = Field(default="root")
    DB_PASSWORD: str = Field(default="")
    DB_NAME: str = Field(default="leadiq_db")

    # Local SQLite Fallback (useful if local MySQL daemon isn't running)
    USE_SQLITE_FALLBACK: bool = Field(default=True)
    SQLITE_DB_PATH: str = Field(default="./leadiq.db")

    # JWT Configuration
    JWT_SECRET_KEY: str = Field(default="leadiq_super_secret_jwt_key_2026_enterprise_production")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440)  # 24 hours

    # Environment & CORS
    APP_ENV: str = Field(default="development")
    CORS_ORIGINS: str = Field(default="http://localhost:4200,http://127.0.0.1:4200")

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return ["http://localhost:4200", "http://127.0.0.1:4200"]

    @property
    def mysql_database_url(self) -> str:
        # URL encode password if needed
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    @property
    def sqlite_database_url(self) -> str:
        return f"sqlite:///{self.SQLITE_DB_PATH}"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
