import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.database.base import Base

logger = logging.getLogger(__name__)

def create_db_engine():
    # Attempt to connect to MySQL first
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
