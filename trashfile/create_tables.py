from app.database.database import engine, Base
from app.models import (
    users, students, batches, enrollment,
    assignments, submissions, attendance,
    leaves, announcements
)

print("Creating all database tables...")

# This will create all tables
Base.metadata.create_all(bind=engine)

print("Tables created successfully!")

# Verify tables were created
import sqlite3
conn = sqlite3.connect('dozo.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("\nTables now in database:")
for table in tables:
    print(f"  - {table[0]}")
    
conn.close()
