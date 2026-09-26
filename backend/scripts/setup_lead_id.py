import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.database.connection import engine, SessionLocal

def setup():
    db = SessionLocal()
    try:
        # 1. Create lead_sequences table
        print("[1/4] Ensuring lead_sequences table exists...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS lead_sequences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        """))
        db.commit()

        # 2. Check if public_lead_id column exists on leads table
        print("[2/4] Checking public_lead_id column on leads table...")
        columns = [r[0] for r in db.execute(text("DESCRIBE leads")).fetchall()]
        if "public_lead_id" not in columns:
            print("Adding public_lead_id column to leads table...")
            db.execute(text("""
                ALTER TABLE leads ADD COLUMN public_lead_id VARCHAR(32) UNIQUE AFTER id;
            """))
            db.execute(text("""
                CREATE INDEX ix_leads_public_lead_id ON leads (public_lead_id);
            """))
            db.commit()
            print("Column public_lead_id added successfully.")
        else:
            print("Column public_lead_id already exists.")

        # 3. Backfill existing leads with legacy identifiers if null
        print("[3/4] Backfilling existing leads with null public_lead_id...")
        existing_leads = db.execute(text("""
            SELECT id, created_at FROM leads 
            WHERE public_lead_id IS NULL OR public_lead_id = ''
            ORDER BY created_at ASC
        """)).fetchall()

        print(f"Found {len(existing_leads)} leads needing public_lead_id.")
        for idx, (lead_id, _) in enumerate(existing_leads, start=1):
            legacy_id = f"LEAD-LEGACY-{idx:06d}"
            db.execute(text("""
                UPDATE leads SET public_lead_id = :pub_id WHERE id = :lead_id
            """), {"pub_id": legacy_id, "lead_id": lead_id})
        
        db.commit()
        print(f"Backfilled {len(existing_leads)} leads successfully.")

        # 4. Check sequence counter
        seq_count = db.execute(text("SELECT COUNT(*) FROM lead_sequences")).scalar()
        print(f"[4/4] Current lead_sequences entries: {seq_count}")
        if seq_count == 0:
            db.execute(text("ALTER TABLE lead_sequences AUTO_INCREMENT = 1"))
            db.commit()
            print("Reset lead_sequences AUTO_INCREMENT to 1.")

        print("=== Setup Completed Successfully! ===")
    finally:
        db.close()

if __name__ == "__main__":
    setup()
