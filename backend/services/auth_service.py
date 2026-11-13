# backend/services/auth_service.py

import os
from utils.security import (
    hash_password,
    verify_password,
    create_jwt
)
from models.user_model import UserModel
from services.otp_service import OTPService


class AuthService:

    @staticmethod
    def register_citizen(data):
        email = data.get("email", "").strip().lower()
        existing_user = UserModel.find_by_email(email)

        if existing_user:
            return None, "Email address is already registered"

        full_name = data.get("full_name") or data.get("fullName") or "Citizen"

        user = UserModel.create_citizen({
            "full_name": full_name.strip(),
            "email": email,
            "mobile": data.get("mobile", "").strip(),
            "password_hash": hash_password(data["password"])
        })

        return user, None

    @staticmethod
    def register_staff(data):
        email = data.get("email", "").strip().lower()
        existing_user = UserModel.find_by_email(email)

        if existing_user:
            return None, "Staff email address is already registered"

        target_role = data.get("requested_role") or data.get("role") or "MUNICIPAL_ADMIN"
        if target_role not in ["ADMIN", "MUNICIPAL_ADMIN", "HIGHER_AUTHORITY"]:
            target_role = "MUNICIPAL_ADMIN"

        full_name = data.get("full_name") or data.get("fullName") or "Municipal Staff"

        user = UserModel.create_staff({
            "full_name": full_name.strip(),
            "email": email,
            "mobile": data.get("mobile", "").strip(),
            "password_hash": hash_password(data["password"]),
            "role": target_role,
            "requested_role": target_role,
            "designation": data.get("designation", "Municipal Officer"),
            "department": data.get("department"),
            "jurisdiction": data.get("jurisdiction"),
            "account_status": "PENDING_APPROVAL"
        })

        return user, None

    @staticmethod
    def login_citizen(data):
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        user = UserModel.find_by_email(email)

        if not user:
            return None, "Invalid email or password"

        if user.get("role") != "CITIZEN":
            return None, "This account is not a Citizen account. Please use Staff Login."

        account_status = user.get("account_status", "ACTIVE")
        if account_status != "ACTIVE":
            return None, f"Your citizen account is {account_status.lower()}. Please contact support."

        if not verify_password(password, user["password_hash"]):
            return None, "Invalid email or password"

        UserModel.update_last_login(user["_id"])

        token = create_jwt(str(user["_id"]), "CITIZEN")

        return {
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "fullName": user["full_name"],
                "email": user["email"],
                "role": "CITIZEN"
            },
            # Backward-compatible fields
            "user_id": str(user["_id"]),
            "full_name": user["full_name"],
            "role": "CITIZEN"
        }, None

    @staticmethod
    def login_staff(email, password):
        email = email.strip().lower()
        user = UserModel.find_by_email(email)

        if not user:
            return None, "Invalid email or password"

        account_status = user.get("account_status", "ACTIVE")
        if account_status == "PENDING_APPROVAL":
            return None, "Account is pending approval from System Administrator"
        elif account_status != "ACTIVE":
            return None, f"Staff account is {account_status.lower()}"

        allowed_staff_roles = [
            "ADMIN",
            "MUNICIPAL_ADMIN",
            "HIGHER_AUTHORITY",
            "SYSTEM_ADMIN"
        ]

        if user.get("role") not in allowed_staff_roles:
            return None, "Account is not recognized as a staff or authority profile"

        if not verify_password(password, user["password_hash"]):
            return None, "Invalid email or password"

        # Generate and dispatch OTP
        otp = OTPService.generate_and_send_otp(
            user_id=str(user["_id"]),
            email=user["email"]
        )

        return {
            "otpRequired": True,
            "otp_sent": True,
            "email": user["email"],
            "devOtp": otp,
            "user_id": str(user["_id"]),
            "role": user["role"]
        }, None
