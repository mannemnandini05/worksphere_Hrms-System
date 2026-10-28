"""Create or promote an administrator using environment variables.

PowerShell example (from backend folder):
  $env:ADMIN_USERNAME = "admin"
  $env:ADMIN_EMAIL = "admin@example.com"
  $env:ADMIN_PASSWORD = "Use-A-Long-Unique-Password"
  python create_admin.py

No default password is embedded in the project.
"""
import os
import sys

from app.database import Base, SessionLocal, engine
from app.models import User
from app.security import hash_password


def main() -> int:
    username = os.getenv("ADMIN_USERNAME", "").strip()
    email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    password = os.getenv("ADMIN_PASSWORD", "")
    if not username or not email or len(password) < 12:
        print("Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters).")
        return 2

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter((User.username == username) | (User.email == email)).first()
        if user:
            user.username = username
            user.email = email
            user.hashed_password = hash_password(password)
            user.role = "ADMIN"
            user.is_active = True
            message = "Existing account updated as ADMIN."
        else:
            user = User(username=username, email=email, hashed_password=hash_password(password), role="ADMIN", is_active=True)
            db.add(user)
            message = "Administrator account created."
        db.commit()
        print(message)
        print(f"Username: {username}\nEmail: {email}\nRole: ADMIN")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
