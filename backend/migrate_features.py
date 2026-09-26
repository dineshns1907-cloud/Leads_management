import logging
from sqlalchemy import text
from app.database.connection import engine
from app.database.base import Base
# Ensure all models are imported so Base.metadata knows about them
import app.models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migration")

def run_migration():
    logger.info("Starting schema migration for 3 new features...")
    
    # 1. Create tables that don't exist (like referrals)
    Base.metadata.create_all(bind=engine)
    logger.info("Base.metadata.create_all completed.")

    # 2. Add columns to existing tables safely using ALTER TABLE ... IF NOT EXISTS or inspection
    with engine.connect() as conn:
        # Check users table for department
        result = conn.execute(text("SHOW COLUMNS FROM users LIKE 'department'")).fetchone()
        if not result:
            conn.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL"))
            logger.info("Added 'department' column to 'users' table.")
        else:
            logger.info("'department' column already exists in 'users'.")

        # Check leads table for referred_by_id
        result = conn.execute(text("SHOW COLUMNS FROM leads LIKE 'referred_by_id'")).fetchone()
        if not result:
            conn.execute(text("ALTER TABLE leads ADD COLUMN referred_by_id VARCHAR(64) NULL"))
            conn.execute(text("ALTER TABLE leads ADD CONSTRAINT fk_leads_referred_by FOREIGN KEY (referred_by_id) REFERENCES leads(id) ON DELETE SET NULL"))
            logger.info("Added 'referred_by_id' column to 'leads' table.")
        else:
            logger.info("'referred_by_id' column already exists in 'leads'.")

        # Check lead_scores table for business priority columns
        result = conn.execute(text("SHOW COLUMNS FROM lead_scores LIKE 'business_priority_score'")).fetchone()
        if not result:
            conn.execute(text("ALTER TABLE lead_scores ADD COLUMN business_priority_score INT NOT NULL DEFAULT 50"))
            conn.execute(text("ALTER TABLE lead_scores ADD COLUMN business_priority_tier VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'"))
            conn.execute(text("ALTER TABLE lead_scores ADD COLUMN business_priority_factors JSON NULL"))
            logger.info("Added business priority columns to 'lead_scores' table.")
        else:
            logger.info("Business priority columns already exist in 'lead_scores'.")

        conn.commit()

    logger.info("Schema migration successfully completed!")

if __name__ == "__main__":
    run_migration()
