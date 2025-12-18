import sys
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import SQLALCHEMY_DATABASE_URL
from app.models.batches import Batches

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_sample_batches():
    db = SessionLocal()
    
    # Check if batches already exist
    existing = db.query(Batches).first()
    if existing:
        print("Batches already exist:")
        batches = db.query(Batches).all()
        for b in batches:
            print(f"  - ID: {b.batch_id}, Name: {b.name}")
        db.close()
        return
    
    # Create sample batches
    batches_data = [
        {"name": "Web Development - Batch A", "teacher_id": 1, "start_date": date(2024, 1, 1), "end_date": date(2024, 6, 30)},
        {"name": "JavaScript - Batch B", "teacher_id": 1, "start_date": date(2024, 2, 1), "end_date": date(2024, 7, 31)},
        {"name": "Advanced - Batch C", "teacher_id": 1, "start_date": date(2024, 3, 1), "end_date": date(2024, 8, 31)},
    ]
    
    for batch_data in batches_data:
        batch = Batches(**batch_data)
        db.add(batch)
    
    db.commit()
    print("✅ Created 3 sample batches:")
    
    batches = db.query(Batches).all()
    for b in batches:
        print(f"  - ID: {b.batch_id}, Name: {b.name}")
    
    db.close()

if __name__ == "__main__":
    create_sample_batches()
