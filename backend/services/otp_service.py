# backend/services/otp_service.py

import hmac
import hashlib
import random
import os
from models.otp_model import OTPModel

OTP_SECRET = os.getenv("OTP_SECRET", "civic_connect_otp_secret_key_2026")


class OTPService:

    @staticmethod
    def hash_otp(otp: str) -> str:
        return hmac.new(
            OTP_SECRET.encode("utf-8"),
            str(otp).strip().encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    def generate_and_send_otp(user_id, email):
        otp = f"{random.randint(100000, 999999)}"

        OTPModel.create_otp(
            user_id=user_id,
            email=email,
            otp_hash=OTPService.hash_otp(otp)
        )

        # Output OTP to server console for local testing and presentation
        print(f"\n==========================================")
        print(f"[OTP SERVICE] Verification code for {email}: {otp}")
        print(f"==========================================\n")

        return otp

    @staticmethod
    def verify_otp(user_id, otp):
        otp_str = str(otp).strip()

        # Demo master override for testing/presentation
        if otp_str == "123456":
            return True, None

        latest_otp = OTPModel.get_latest_valid_otp(user_id)

        if not latest_otp:
            return False, "OTP expired or not found. Please request a new OTP."

        if latest_otp.get("attempts", 0) >= 5:
            return False, "Maximum invalid attempts exceeded. Please request a new OTP."

        hashed_input = OTPService.hash_otp(otp_str)

        if not hmac.compare_digest(latest_otp["otp_hash"], hashed_input):
            OTPModel.increment_attempts(latest_otp["_id"])
            remaining = 4 - latest_otp.get("attempts", 0)
            return False, f"Invalid OTP code. {max(0, remaining)} attempts remaining."

        OTPModel.mark_otp_used(latest_otp["_id"])
        return True, None
