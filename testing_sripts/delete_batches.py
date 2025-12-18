from app.database.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    print("Deleting batches using Raw SQL...")
    
    # Identify unwanted batch IDs
    result = db.execute(text("SELECT batch_id FROM batches WHERE name != 'Batch A'"))
    batch_ids = [row[0] for row in result.fetchall()]
    
    if not batch_ids:
        print("No batches found to delete.")
    else:
        ids_tuple = tuple(batch_ids)
        # Handle singleton tuple for SQL syntax (x,)
        if len(batch_ids) == 1:
            ids_str = f"({batch_ids[0]})"
        else:
            ids_str = str(ids_tuple)
            
        print(f"Target Batch IDs: {ids_str}")

        # Delete from dependencies
        db.execute(text(f"DELETE FROM enrollment WHERE batch_id IN {ids_str}"))
        db.execute(text(f"DELETE FROM attendance_records WHERE batch_id IN {ids_str}"))
        db.execute(text(f"DELETE FROM announcements WHERE batch_id IN {ids_str}"))
        
        # Submissions linked to Assignments linked to Batches
        # SQLite vs Postgres syntax might differ but subquery works generally
        db.execute(text(f"DELETE FROM submissions WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE batch_id IN {ids_str})"))
        
        db.execute(text(f"DELETE FROM assignments WHERE batch_id IN {ids_str}"))
        
        # Finally delete batches
        db.execute(text(f"DELETE FROM batches WHERE batch_id IN {ids_str}"))
        
        db.commit()
        print("Deletion successful.")

    # Verify
    res = db.execute(text("SELECT batch_id, name FROM batches"))
    print("\nRemaining Batches:")
    for row in res:
        print(f"ID: {row[0]} | Name: {row[1]}")

except Exception as e:
    import traceback
    with open("delete_log.txt", "w") as f:
        f.write(str(e))
        f.write("\n")
        f.write(traceback.format_exc())
    print(f"Error occurred. Check delete_log.txt")
    db.rollback()
finally:
    db.close()
