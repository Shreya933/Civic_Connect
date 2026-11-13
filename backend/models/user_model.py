# backend/models/user_model.py

from datetime import datetime, timezone
from bson import ObjectId
from database import users_collection


class UserModel:
    COLLECTION = users_collection

    ROLES = [
        "CITIZEN",
        "MUNICIPAL_ADMIN",
        "ADMIN",
        "HIGHER_AUTHORITY",
        "SYSTEM_ADMIN"
    ]

    @staticmethod
    def create_indexes():
        UserModel.COLLECTION.create_index("email", unique=True)
        UserModel.COLLECTION.create_index(
            "employee_id",
            unique=True,
            sparse=True
        )
        UserModel.COLLECTION.create_index(
            [("account_status", 1), ("requested_role", 1), ("created_at", -1)]
        )

    @staticmethod
    def create_citizen(data):
        now = datetime.now(timezone.utc)

        document = {
            "full_name": data["full_name"],
            "email": data["email"].strip().lower(),
            "mobile": data.get("mobile", ""),
            "password_hash": data["password_hash"],
            "role": "CITIZEN",
            "requested_role": None,

            "account_status": "ACTIVE",
            "email_verified": True,

            "employee_id": None,
            "designation": None,
            "jurisdiction": None,

            "two_factor_required": False,

            "approved_by": None,
            "approved_at": None,
            "rejection_reason": None,

            "failed_login_count": 0,
            "locked_until": None,
            "last_login_at": None,

            "created_at": now,
            "updated_at": now
        }

        result = UserModel.COLLECTION.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    @staticmethod
    def create_staff(data):
        now = datetime.now(timezone.utc)

        target_role = data.get("role") or data.get("requested_role") or "MUNICIPAL_ADMIN"
        status = data.get("account_status", "PENDING_APPROVAL")

        document = {
            "full_name": data["full_name"],
            "email": data["email"].strip().lower(),
            "mobile": data.get("mobile", ""),
            "password_hash": data["password_hash"],
            "role": target_role,
            "requested_role": data.get("requested_role", target_role),

            "account_status": status,
            "email_verified": True,

            "employee_id": data.get("employee_id"),
            "designation": data.get("designation", "Municipal Officer"),
            "department": data.get("department"),
            "department_id": data.get("department_id"),
            "jurisdiction": data.get("jurisdiction"),

            "two_factor_required": True,

            "approved_by": data.get("approved_by"),
            "approved_at": data.get("approved_at", now if status == "ACTIVE" else None),
            "rejection_reason": None,

            "failed_login_count": 0,
            "locked_until": None,
            "last_login_at": None,

            "created_at": now,
            "updated_at": now
        }

        result = UserModel.COLLECTION.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    @staticmethod
    def find_by_email(email):
        if not email:
            return None
        return UserModel.COLLECTION.find_one(
            {"email": email.strip().lower()}
        )

    @staticmethod
    def find_by_id(user_id):
        if not user_id:
            return None
        try:
            oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
            return UserModel.COLLECTION.find_one({"_id": oid})
        except Exception:
            return None

    @staticmethod
    def update_last_login(user_id):
        try:
            oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
            UserModel.COLLECTION.update_one(
                {"_id": oid},
                {"$set": {
                    "last_login_at": datetime.now(timezone.utc)
                }}
            )
        except Exception:
            pass
