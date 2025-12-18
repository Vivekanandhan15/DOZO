from app.database.database import SessionLocal, engine
from app.models.users import Users
from app.utils.hashing import hash_password

def create_admin():
    db = SessionLocal()
    try:
        email = "admin@dozo.com"
        existing = db.query(Users).filter(Users.email == email).first()
        if existing:
            print(f"Admin user {email} already exists.")
            return

        admin = Users(
            name="Super Admin",
            email=email,
            password=hash_password("admin123"),
            role="ADMIN",
            phone="1234567890"
        )
        db.add(admin)
        db.commit()
        print(f"✅ Created Admin User:\nEmail: {email}\nPassword: admin123")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
