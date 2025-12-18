from app.database.database import SessionLocal
from app.models.batches import Batches

db = SessionLocal()
batches = db.query(Batches).all()
print(f"Found {len(batches)} batches:")
for b in batches:
    print(f"ID: {b.batch_id} | Name: {b.name}")
db.close()
