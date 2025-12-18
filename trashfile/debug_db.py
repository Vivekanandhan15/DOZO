import sqlite3
import json

# Connect to database
conn = sqlite3.connect('dozo.db')
cursor = conn.cursor()

print("=== BATCHES ===")
cursor.execute("SELECT * FROM batches")
batches = cursor.fetchall()
if batches:
    print(f"Found {len(batches)} batches:")
    for batch in batches:
        print(f"  {batch}")
else:
    print("No batches found!")

print("\n=== ENROLLMENT ===")
cursor.execute("SELECT * FROM enrollment LIMIT 10")
enrollments = cursor.fetchall()
if enrollments:
    print(f"Found {len(enrollments)} enrollment records:")
    for enroll in enrollments:
        print(f"  {enroll}")
else:
    print("No enrollments found!")

print("\n=== STUDENTS (first 5) ===")
cursor.execute("SELECT student_id, user_id, roll_no FROM students LIMIT 5")
students = cursor.fetchall()
for student in students:
    print(f"  {student}")

conn.close()
