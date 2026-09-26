import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.database.base import Base

import urllib.parse

logger = logging.getLogger(__name__)

def sanitize_database_url(url: str) -> str:
    """Ensure database URL has the correct driver dialect and encoded special characters."""
    if not url:
        return url
    trimmed = url.strip()
    if trimmed.startswith("postgresql://"):
        trimmed = trimmed.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    # Auto-encode '@' in password if present before host
    if "://" in trimmed:
        scheme, rest = trimmed.split("://", 1)
        if "@" in rest:
            parts = rest.split("@")
            if len(parts) > 2:
                user_pass = "@".join(parts[:-1])
                host_part = parts[-1]
                if ":" in user_pass:
                    u, p = user_pass.split(":", 1)
                    user_pass = f"{u}:{urllib.parse.quote(p)}"
                trimmed = f"{scheme}://{user_pass}@{host_part}"
    return trimmed

import re

def get_supabase_pooler_fallback_url(url: str) -> str:
    """If direct Supabase connection fails due to IPv6 DNS resolution, return IPv4 pooler URL."""
    try:
        m = re.search(r"db\.([a-z0-9]+)\.supabase\.co", url)
        if m:
            ref = m.group(1)
            pooler_host = "aws-0-ap-northeast-1.pooler.supabase.com"
            new_url = url.replace(f"db.{ref}.supabase.co", pooler_host)
            new_url = re.sub(r"://([^:@]+):", rf"://\1.{ref}:", new_url)
            return new_url
    except Exception:
        pass
    return None

def create_db_engine():
    # 1. Attempt connection using DATABASE_URL if configured (e.g. Supabase, PostgreSQL)
    if settings.DATABASE_URL:
        db_url = sanitize_database_url(settings.DATABASE_URL)
        try:
            connect_args = {"connect_timeout": 5} if "sqlite" not in db_url else {"check_same_thread": False}
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args=connect_args
            )
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected successfully to primary database via DATABASE_URL.")
            return engine
        except Exception as e:
            logger.warning(f"Could not connect using primary DATABASE_URL ({e}).")
            # Try Supabase IPv4 pooler fallback if applicable
            pooler_url = get_supabase_pooler_fallback_url(db_url)
            if pooler_url and pooler_url != db_url:
                try:
                    logger.info("Attempting connection via Supabase IPv4 connection pooler...")
                    engine = create_engine(
                        pooler_url,
                        pool_pre_ping=True,
                        pool_recycle=3600,
                        connect_args={"connect_timeout": 5}
                    )
                    with engine.connect() as conn:
                        conn.execute(text("SELECT 1"))
                    logger.info("Connected successfully to Supabase via IPv4 pooler.")
                    return engine
                except Exception as pe:
                    logger.warning(f"Could not connect via Supabase pooler ({pe}).")

            if not settings.USE_SQLITE_FALLBACK and not settings.DB_HOST:
                raise e

    # 2. Attempt to connect to MySQL
    mysql_url = settings.mysql_database_url
    try:
        engine = create_engine(
            mysql_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"connect_timeout": 3}
        )
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Connected successfully to MySQL at {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to MySQL ({e}).")
        if settings.USE_SQLITE_FALLBACK:
            logger.info(f"Falling back to local SQLite at {settings.sqlite_database_url} for local development/testing.")
            sqlite_engine = create_engine(
                settings.sqlite_database_url,
                connect_args={"check_same_thread": False}
            )
            return sqlite_engine
        else:
            raise e

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
