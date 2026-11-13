# backend/utils/security.py

import os
from pathlib import Path
from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import jwt
from flask import request, jsonify
from dotenv import load_dotenv

# Ensure environment variables are loaded
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


def get_jwt_secret() -> str:
    return os.getenv("JWT_SECRET", "998b5a66cf15d26653dda3e9c4093e8d92e4de96d6c99b80b7a3478d8f45f287")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8")
        )
    except Exception:
        return False


def create_jwt(user_id: str, role: str) -> str:
    payload = {
        "user_id": str(user_id),
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc)
    }

    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_jwt(token: str):
    try:
        return jwt.decode(
            token,
            get_jwt_secret(),
            algorithms=[JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None


def get_current_user_from_request():
    """Extract and validate the JWT token, and verify user is ACTIVE in database."""
    from models.user_model import UserModel

    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        return None, "Authorization header is missing"

    if not auth_header.startswith("Bearer "):
        return None, "Authorization token must use Bearer scheme"

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None, "Bearer token is empty"

    payload = decode_jwt(token)
    if not payload:
        return None, "Token is invalid or has expired"

    user_id = payload.get("user_id")
    if not user_id:
        return None, "Malformed token payload"

    user = UserModel.find_by_id(user_id)
    if not user:
        return None, "User account no longer exists"

    account_status = user.get("account_status", "ACTIVE")
    if account_status != "ACTIVE":
        return None, f"Account is {account_status.lower()}"

    # Return standard user payload
    current_user = {
        "user_id": str(user["_id"]),
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "fullName": user.get("full_name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", payload.get("role")),
        "account_status": account_status,
        "department": user.get("department"),
        "raw_user": user
    }
    return current_user, None


def get_current_user():
    user, _ = get_current_user_from_request()
    return user


def role_required(*allowed_roles):
    # Support interchangeable ADMIN and MUNICIPAL_ADMIN
    normalized_allowed = set()
    for r in allowed_roles:
        normalized_allowed.add(r)
        if r in ("ADMIN", "MUNICIPAL_ADMIN"):
            normalized_allowed.add("ADMIN")
            normalized_allowed.add("MUNICIPAL_ADMIN")

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_user, error = get_current_user_from_request()

            if error or not current_user:
                return jsonify({
                    "success": False,
                    "status": "error",
                    "message": error or "Authentication token is missing, invalid, or expired"
                }), 401

            user_role = current_user.get("role")
            if user_role not in normalized_allowed:
                return jsonify({
                    "success": False,
                    "status": "error",
                    "message": f"Access denied. Required role: {', '.join(allowed_roles)}. Your role: {user_role}."
                }), 403

            return func(current_user=current_user, *args, **kwargs)

        return wrapper

    return decorator


def admin_required(func):
    return role_required("MUNICIPAL_ADMIN", "ADMIN")(func)


def citizen_required(func):
    return role_required("CITIZEN")(func)


def authority_required(func):
    return role_required("HIGHER_AUTHORITY")(func)


def sysadmin_required(func):
    return role_required("SYSTEM_ADMIN")(func)
