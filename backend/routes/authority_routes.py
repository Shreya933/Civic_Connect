# backend/routes/authority_routes.py

from functools import wraps
from flask import Blueprint, jsonify, request
from werkzeug.exceptions import BadRequest, HTTPException

from services.authority_service import AuthorityService, serialize
from utils.security import role_required

authority_bp = Blueprint("authority_bp", __name__)


def authority_endpoint(function):
    @wraps(function)
    def wrapper(current_user, *args, **kwargs):
        service = AuthorityService(current_user["user_id"])
        return function(service, *args, **kwargs)

    return role_required("HIGHER_AUTHORITY")(wrapper)


@authority_bp.errorhandler(HTTPException)
def handle_http_error(error):
    return jsonify({
        "success": False,
        "status": "error",
        "message": error.description,
    }), error.code


def json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise BadRequest("A JSON object body is required")
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


@authority_bp.route("/dashboard", methods=["GET"])
@authority_endpoint
def dashboard(service):
    return success(service.dashboard())


@authority_bp.route("/department-performance", methods=["GET"])
@authority_endpoint
def department_performance(service):
    return success(service.department_performance())


@authority_bp.route("/overdue", methods=["GET"])
@authority_endpoint
def current_overdue(service):
    page, limit = pagination()
    return success(service.overdue_reports(
        historical=False, page=page, limit=limit
    ))


@authority_bp.route("/historical-overdue", methods=["GET"])
@authority_endpoint
def historical_overdue(service):
    page, limit = pagination()
    return success(service.overdue_reports(
        historical=True, page=page, limit=limit
    ))


@authority_bp.route("/actions", methods=["POST"])
@authority_endpoint
def create_action(service):
    return success(service.create_action(json_body()), 201)


@authority_bp.route("/actions", methods=["GET"])
@authority_endpoint
def list_actions(service):
    page, limit = pagination()
    return success(service.list_actions(page=page, limit=limit))


@authority_bp.route("/actions/<action_id>/close", methods=["PATCH"])
@authority_endpoint
def close_action(service, action_id):
    return success(service.close_action(action_id))
