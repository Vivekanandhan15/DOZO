from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:AcademyRootPassword@localhost:5432/postgres", isolation_level="AUTOCOMMIT")

with engine.connect() as conn:
    conn.execute(text("CREATE DATABASE dozo_db"))
    conn.commit()

print("Database created")