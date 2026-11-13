# backend/routes/sysadmin_routes.py

from functools import wraps
from flask import Blueprint, jsonify, request
from werkzeug.exceptions import BadRequest, HTTPException

from services.sysadmin_service import SysAdminService, serialize
from utils.security import role_required

sysadmin_bp = Blueprint("sysadmin_bp", __name__)


def sysadmin_endpoint(function):
    @wraps(function)
    def wrapper(current_user, *args, **kwargs):
        service = SysAdminService(current_user["user_id"])
        return function(service, *args, **kwargs)

    return role_required("SYSTEM_ADMIN")(wrapper)


@sysadmin_bp.errorhandler(HTTPException)
def handle_http_error(error):
    return jsonify({
        "success": False,
        "status": "error",
        "message": error.description,
    }), error.code


def json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {}
    return data


def pagination():
    try:
        page = int(request.args.get("page", "1"))
        limit = int(request.args.get("limit", "20"))
    except (TypeError, ValueError):
        raise BadRequest("page and limit must be integers")

    if page < 1 or not 1 <= limit <= 100:
        raise BadRequest("page must be >= 1; limit must be 1–100")

    return page, limit


def success(data, status_code=200):
    return jsonify({
        "success": True,
        "status": "success",
        "data": serialize(data),
    }), status_code


@sysadmin_bp.route("/pending-staff", methods=["GET"])
@sysadmin_endpoint
def pending_staff(service):
    page, limit = pagination()
    return success(service.pending_staff(page=page, limit=limit))


@sysadmin_bp.route("/users", methods=["GET"])
@sysadmin_endpoint
def all_users(service):
    page, limit = pagination()

    return success(service.all_users(
        page=page,
        limit=limit,
        role=request.args.get("role"),
        status=request.args.get("status"),
        search=request.args.get("search"),
    ))


@sysadmin_bp.route("/staff/<staff_id>/approve", methods=["PATCH", "POST"])
@sysadmin_endpoint
def approve_staff(service, staff_id):
    return success(
        service.approve_staff(staff_id, json_body()),
        200
    )


@sysadmin_bp.route("/staff/<staff_id>/reject", methods=["PATCH", "POST"])
@sysadmin_endpoint
def reject_staff(service, staff_id):
    return success(
        service.reject_staff(staff_id, json_body()),
        200
    )


@sysadmin_bp.route("/users/<user_id>/status", methods=["PATCH", "POST"])
@sysadmin_endpoint
def update_user_status(service, user_id):
    return success(
        service.set_user_status(user_id, json_body()),
        200
    )
