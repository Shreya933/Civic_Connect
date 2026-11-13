
from datetime import datetime, timezone

from database import users_collection
from utils.security import hash_password

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "Admin@1234"


def create_admin():
    print("Checking database connection...")

    existing_admin = users_collection.find_one({
        "email": ADMIN_EMAIL
    })

    if existing_admin:
        print("Admin account already exists.")
        print("Email:", existing_admin["email"])
        print("Role:", existing_admin["role"])
        return

    now = datetime.now(timezone.utc)

    admin_document = {
        "full_name": "Municipal Admin",
        "email": ADMIN_EMAIL,
        "mobile": "9876543210",
        "password_hash": hash_password(ADMIN_PASSWORD),
        "role": "ADMIN",
        "requested_role": None,
        "account_status": "ACTIVE",
        "email_verified": True,
        "employee_id": "ADMIN-001",
        "designation": "Municipal Administrator",
        "jurisdiction": None,
        "two_factor_required": False,
        "approved_by": None,
        "approved_at": now,
        "rejection_reason": None,
        "failed_login_count": 0,
        "locked_until": None,
        "last_login_at": None,
        "created_at": now,
        "updated_at": now
    }

    result = users_collection.insert_one(admin_document)

    print("Admin account created successfully!")
    print("Email:", ADMIN_EMAIL)
    print("User ID:", result.inserted_id)


if __name__ == "__main__":
    create_admin()
