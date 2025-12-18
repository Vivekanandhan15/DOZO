from app.database.database import SessionLocal
from app.services.users import create_user
from app.schemas.users import UserCreate
import traceback

def test_create_user():
    db = SessionLocal()
    try:
        data = UserCreate(
            name="Debug User",
            email="debug@example.com",
            password="password",
            phone="123",
            role="student"
        )
        print("Attempting to create user...")
        user = create_user(db, data)
        print("User created:", user)
    except Exception:
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_create_user()
