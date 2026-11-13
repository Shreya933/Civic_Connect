# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from bson import ObjectId

from schemas.auth_validator import validate_citizen_registration
from services.auth_service import AuthService
from services.otp_service import OTPService
from models.user_model import UserModel
from utils.security import create_jwt, get_current_user_from_request

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/register/citizen", methods=["POST"])
def register_citizen():
    data = request.get_json() or {}

    errors = validate_citizen_registration(data)
    if errors:
        return jsonify({
            "success": False,
            "status": "error",
            "message": errors[0] if errors else "Validation failed",
            "errors": errors
        }), 400

    user, error = AuthService.register_citizen(data)
    if error:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error
        }), 409

    return jsonify({
        "success": True,
        "status": "success",
        "message": "Citizen registered successfully",
        "data": {
            "user_id": str(user["_id"]),
            "role": user["role"]
        }
    }), 201


@auth_bp.route("/register/staff", methods=["POST"])
def register_staff():
    data = request.get_json() or {}

    if not data.get("full_name") or not data.get("email") or not data.get("password"):
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Full name, email, and password are required"
        }), 400

    user, error = AuthService.register_staff(data)
    if error:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error
        }), 409

    return jsonify({
        "success": True,
        "status": "success",
        "message": "Staff registration submitted. Awaiting System Administrator approval.",
        "data": {
            "staff_id": str(user["_id"]),
            "role": user["role"],
            "account_status": user["account_status"]
        }
    }), 201


@auth_bp.route("/login/citizen", methods=["POST"])
def login_citizen():
    data = request.get_json() or {}

    if not data.get("email") or not data.get("password"):
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Email and password are required"
        }), 400

    result, error = AuthService.login_citizen(data)
    if error:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error
        }), 401

    return jsonify({
        "success": True,
        "status": "success",
        "message": "Login successful",
        "data": result
    }), 200


@auth_bp.route("/login/staff", methods=["POST"])
def login_staff():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Email and password are required"
        }), 400

    result, error = AuthService.login_staff(email, password)
    if error:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error
        }), 401

    return jsonify({
        "success": True,
        "status": "success",
        "message": "OTP verification code sent to your registered email address.",
        "data": result
    }), 200


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json() or {}

    user_id = data.get("user_id")
    email = data.get("email")
    otp = data.get("otp")

    if not otp:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "OTP code is required"
        }), 400

    # Locate user by ID or by Email
    user = None
    if user_id:
        user = UserModel.find_by_id(user_id)
    if not user and email:
        user = UserModel.find_by_email(email)

    if not user:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Staff user account not found"
        }), 404

    is_valid, error = OTPService.verify_otp(str(user["_id"]), otp)
    if not is_valid:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error or "Invalid OTP verification code"
        }), 401

    # Issue JWT token
    token = create_jwt(str(user["_id"]), user["role"])
    UserModel.update_last_login(user["_id"])

    response_data = {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "user_id": str(user["_id"]),
            "fullName": user["full_name"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "department": user.get("department")
        },
        # Direct fields for backward compatibility
        "user_id": str(user["_id"]),
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"]
    }

    return jsonify({
        "success": True,
        "status": "success",
        "message": "Staff authentication successful",
        "data": response_data
    }), 200


@auth_bp.route("/me", methods=["GET"])
def get_current_profile():
    current_user, error = get_current_user_from_request()
    if error or not current_user:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error or "Unauthorized"
        }), 401

    return jsonify({
        "success": True,
        "status": "success",
        "data": {
            "user": {
                "id": current_user["id"],
                "fullName": current_user["fullName"],
                "email": current_user["email"],
                "role": current_user["role"],
                "department": current_user.get("department")
            }
        }
    }), 200
