from app.database.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    print("Adding 'time' column to batches table...")
    # SQLite syntax to add column
    # Check if column exists first? SQLite is lenient or we can try/except
    try:
        db.execute(text("ALTER TABLE batches ADD COLUMN time VARCHAR(50)"))
        print("Column 'time' added.")
    except Exception as e:
        print(f"Column might already exist or error: {e}")
    
    # Update existing batches with a default time
    db.execute(text("UPDATE batches SET time = '09:00 - 11:00 AM' WHERE time IS NULL"))
    db.commit()
    print("Migration complete.")
    
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
