# backend/models/otp_model.py

from datetime import datetime, timedelta, timezone
from bson import ObjectId
from database import otp_challenges_collection


class OTPModel:
    COLLECTION = otp_challenges_collection

    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5

    @staticmethod
    def create_indexes():
        OTPModel.COLLECTION.create_index(
            [("user_id", 1), ("purpose", 1), ("created_at", -1)]
        )

        OTPModel.COLLECTION.create_index(
            "expires_at",
            expireAfterSeconds=3600
        )

    @staticmethod
    def create_otp(user_id, email, otp_hash):
        now = datetime.now(timezone.utc)
        try:
            oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        except Exception:
            oid = user_id

        document = {
            "user_id": oid,
            "email": email.strip().lower() if email else "",
            "purpose": "LOGIN",
            "otp_hash": otp_hash,
            "expires_at": now + timedelta(minutes=OTPModel.OTP_EXPIRY_MINUTES),
            "attempts": 0,
            "resend_count": 0,
            "last_sent_at": now,
            "is_used": False,
            "consumed_at": None,
            "created_at": now
        }

        result = OTPModel.COLLECTION.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    @staticmethod
    def get_latest_valid_otp(user_id):
        now = datetime.now(timezone.utc)
        try:
            oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        except Exception:
            return None

        return OTPModel.COLLECTION.find_one({
            "user_id": oid,
            "purpose": "LOGIN",
            "is_used": {"$ne": True},
            "expires_at": {"$gt": now}
        }, sort=[("created_at", -1)])

    @staticmethod
    def increment_attempts(otp_id):
        OTPModel.COLLECTION.update_one(
            {"_id": otp_id},
            {"$inc": {"attempts": 1}}
        )

    @staticmethod
    def mark_otp_used(otp_id):
        OTPModel.COLLECTION.update_one(
            {"_id": otp_id},
            {"$set": {
                "consumed_at": datetime.now(timezone.utc),
                "is_used": True
            }}
        )
