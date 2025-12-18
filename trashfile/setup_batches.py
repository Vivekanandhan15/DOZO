import sqlite3
from datetime import date

conn = sqlite3.connect('dozo.db')
cursor = conn.cursor()

# Create batches table
print("Creating batches table...")
cursor.execute('''
    CREATE TABLE IF NOT EXISTS batches (
        batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100),
        teacher_id INTEGER,
        start_date DATE,
        end_date DATE,
        FOREIGN KEY (teacher_id) REFERENCES users(user_id)
    )
''')

# Insert sample batches
print("Inserting sample batches...")
batches = [
    ("Web Development - Batch A", 1, "2024-01-01", "2024-06-30"),
    ("JavaScript - Batch B", 1, "2024-02-01", "2024-07-31"),
    ("Advanced - Batch C", 1, "2024-03-01", "2024-08-31"),
]

cursor.executemany(
    "INSERT INTO batches (name, teacher_id, start_date, end_date) VALUES (?, ?, ?, ?)",
    batches
)

conn.commit()

# Verify
cursor.execute("SELECT * FROM batches")
result = cursor.fetchall()
print(f"\nCreated {len(result)} batches:")
for row in result:
    print(f"  ID: {row[0]}, Name: {row[1]}")

# Check enrollment table
print("\n=== Checking Enrollment table ===")
cursor.execute("SELECT enroll_id, student_id, batch_id FROM enrollment LIMIT 5")
enrollments = cursor.fetchall()
if enrollments:
    print(f"Found {len(enrollments)} enrollment records:")
    for e in enrollments:
        print(f"  Enroll ID: {e[0]}, Student ID: {e[1]}, Batch ID: {e[2]}")
        
    # Check if any enrollment has invalid batch_id
    cursor.execute("SELECT batch_id FROM enrollment WHERE batch_id NOT IN (SELECT batch_id FROM batches)")
    invalid = cursor.fetchall()
    if invalid:
        print(f"\nWARNING: Found {len(invalid)} enrollments with invalid batch IDs:")
        for inv in invalid:
            print(f"  Invalid Batch ID: {inv[0]}")
else:
    print("No enrollments found")

conn.close()
