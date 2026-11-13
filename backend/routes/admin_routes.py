# backend/routes/admin_routes.py

from flask import Blueprint, request, jsonify
from bson import ObjectId

from models.complaint_model import ComplaintModel
from models.assignment_model import AssignmentModel
from models.department_model import DepartmentModel

from services.assignment_service import AssignmentService
from services.overdue_service import OverdueService

from schemas.assignment_validator import validate_assignment
from utils.security import admin_required

admin_bp = Blueprint("admin_bp", __name__)


def serialize_assignment(assignment):
    # Lookup department name if available
    dept_name = "General Department"
    if assignment.get("department_id"):
        dept = DepartmentModel.get_department_by_id(assignment["department_id"])
        if dept:
            dept_name = dept.get("name", dept_name)

    return {
        "id": str(assignment["_id"]),
        "report_id": assignment.get("report_id"),

        "complaint_id": (
            str(assignment["complaint_id"])
            if assignment.get("complaint_id") else None
        ),

        "department_id": (
            str(assignment["department_id"])
            if assignment.get("department_id") else None
        ),
        "department_name": dept_name,

        "worker_count": assignment.get("worker_count"),

        "assigned_at": assignment.get("assigned_at"),
        "deadline_at": assignment.get("deadline_at"),

        "status": assignment.get("status"),
        "is_active": assignment.get("is_active"),

        "was_overdue": assignment.get("was_overdue", False),
        "first_overdue_at": assignment.get("first_overdue_at"),

        "completed_at": assignment.get("completed_at"),
        "completion_image": assignment.get("completion_image"),
        "completion_note": assignment.get("completion_note"),
        "deadline_met": assignment.get("deadline_met")
    }


@admin_bp.route("/dashboard-stats", methods=["GET"])
@admin_required
def dashboard_stats(current_user):
    OverdueService.check_and_mark_overdue_assignments()

    total = ComplaintModel.COLLECTION.count_documents({})
    pending = ComplaintModel.COLLECTION.count_documents({"status": "PENDING_REVIEW"})
    in_progress = ComplaintModel.COLLECTION.count_documents({"status": "IN_PROGRESS"})
    resolved = ComplaintModel.COLLECTION.count_documents({"status": "RESOLVED"})
    rejected = ComplaintModel.COLLECTION.count_documents({"status": "REJECTED"})
    overdue_assignments = AssignmentModel.COLLECTION.count_documents({"status": "OVERDUE"})
    historical_overdue = AssignmentModel.COLLECTION.count_documents({"was_overdue": True})

    return jsonify({
        "success": True,
        "status": "success",
        "data": {
            "total_complaints": total,
            "pending_review": pending,
            "in_progress": in_progress,
            "resolved": resolved,
            "rejected": rejected,
            "overdue_assignments": overdue_assignments,
            "historical_overdue": historical_overdue
        }
    }), 200


@admin_bp.route("/complaints/pending", methods=["GET"])
@admin_required
def get_pending_complaints(current_user):
    complaints = list(
        ComplaintModel.COLLECTION.find({
            "status": "PENDING_REVIEW"
        }).sort("submitted_at", -1)
    )

    return jsonify({
        "success": True,
        "status": "success",
        "count": len(complaints),
        "complaints": [
            {
                "id": str(complaint["_id"]),
                "complaint_id": complaint["complaint_id"],
                "category": complaint.get("prediction", {}).get("category", "General Civic Issue"),
                "ai_state": complaint.get("prediction", {}).get("state"),
                "confidence": complaint.get("prediction", {}).get("confidence", 0.85),
                "image_url": complaint.get("image", {}).get("url"),
                "thumbnail_url": complaint.get("image", {}).get("thumbnail_url"),
                "location": complaint.get("address") or complaint.get("city") or "Location specified via GPS",
                "address": complaint.get("address"),
                "submitted_at": complaint.get("submitted_at"),
                "status": complaint.get("status")
            }
            for complaint in complaints
        ]
    }), 200


@admin_bp.route("/complaints/<complaint_id>", methods=["GET"])
@admin_required
def get_complaint_details(complaint_id, current_user):
    try:
        query = {"$or": [{"complaint_id": complaint_id}]}
        if ObjectId.is_valid(complaint_id):
            query["$or"].append({"_id": ObjectId(complaint_id)})
        complaint = ComplaintModel.COLLECTION.find_one(query)
    except Exception:
        complaint = None

    if not complaint:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Complaint record not found"
        }), 404

    return jsonify({
        "success": True,
        "status": "success",
        "complaint": {
            "id": str(complaint["_id"]),
            "complaint_id": complaint["complaint_id"],
            "source": complaint.get("source", "CITIZEN_WEB"),
            "image": complaint.get("image"),
            "prediction": complaint.get("prediction"),
            "location": complaint.get("location"),
            "address": complaint.get("address"),
            "status": complaint.get("status"),
            "submitted_at": complaint.get("submitted_at"),
            "completed_at": complaint.get("completed_at"),
            "description": complaint.get("description", "Civic complaint reported by citizen"),
            "title": complaint.get("title", f"Complaint {complaint['complaint_id']}")
        }
    }), 200


@admin_bp.route("/departments", methods=["GET"])
@admin_required
def get_departments(current_user):
    departments = DepartmentModel.get_all_departments()
    return jsonify({
        "success": True,
        "status": "success",
        "departments": [
            {
                "id": str(dept["_id"]),
                "name": dept["name"],
                "description": dept.get("description", "")
            }
            for dept in departments
        ]
    }), 200


@admin_bp.route("/complaints/<complaint_id>/approve", methods=["POST"])
@admin_required
def approve_complaint(complaint_id, current_user):
    data = request.get_json() or {}

    errors = validate_assignment(data)
    if errors:
        return jsonify({
            "success": False,
            "status": "error",
            "message": errors[0] if errors else "Validation failed",
            "errors": errors
        }), 400

    assignment, error = AssignmentService.approve_and_assign(
        complaint_id=complaint_id,
        admin_id=current_user["user_id"],
        data=data
    )

    if error:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error
        }), 400

    return jsonify({
        "success": True,
        "status": "success",
        "message": "Complaint approved and assigned to department",
        "report_id": assignment["report_id"],
        "assignment_id": str(assignment["_id"]),
        "status": assignment["status"]
    }), 201


@admin_bp.route("/complaints/<complaint_id>/reject", methods=["POST"])
@admin_required
def reject_complaint(complaint_id, current_user):
    data = request.get_json() or {}
    reason = data.get("reason")

    if not reason or not str(reason).strip():
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Rejection reason is required"
        }), 400

    complaint, error = AssignmentService.reject_complaint(
        complaint_id=complaint_id,
        admin_id=current_user["user_id"],
        reason=str(reason).strip()
    )

    if error:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error
        }), 400

    return jsonify({
        "success": True,
        "status": "success",
        "message": "Complaint rejected successfully",
        "complaint_id": complaint["complaint_id"],
        "status": complaint["status"]
    }), 200


@admin_bp.route("/assignments/in-progress", methods=["GET"])
@admin_required
def get_in_progress(current_user):
    assignments = AssignmentModel.get_in_progress_assignments()
    return jsonify({
        "success": True,
        "status": "success",
        "count": len(assignments),
        "assignments": [
            serialize_assignment(assignment)
            for assignment in assignments
        ]
    }), 200


@admin_bp.route("/check-overdue", methods=["POST"])
@admin_required
def check_overdue_assignments(current_user):
    result = OverdueService.check_and_mark_overdue_assignments()
    return jsonify({
        "success": True,
        "status": "success",
        "message": "Overdue check completed",
        "data": result
    }), 200


@admin_bp.route("/assignments/overdue", methods=["GET"])
@admin_required
def get_overdue_assignments(current_user):
    OverdueService.check_and_mark_overdue_assignments()
    assignments = OverdueService.get_overdue_assignments()
    return jsonify({
        "success": True,
        "status": "success",
        "count": len(assignments),
        "assignments": [
            serialize_assignment(assignment)
            for assignment in assignments
        ]
    }), 200


@admin_bp.route("/assignments/historical-overdue", methods=["GET"])
@admin_required
def get_historical_overdue_assignments(current_user):
    assignments = OverdueService.get_historical_overdue_assignments()
    return jsonify({
        "success": True,
        "status": "success",
        "count": len(assignments),
        "assignments": [
            serialize_assignment(assignment)
            for assignment in assignments
        ]
    }), 200


@admin_bp.route("/assignments/resolved", methods=["GET"])
@admin_required
def get_resolved_assignments(current_user):
    assignments = AssignmentModel.get_resolved_assignments()
    return jsonify({
        "success": True,
        "status": "success",
        "count": len(assignments),
        "assignments": [
            serialize_assignment(assignment)
            for assignment in assignments
        ]
    }), 200


@admin_bp.route("/assignments/<assignment_id>/resolve", methods=["POST"])
@admin_required
def resolve_assignment(assignment_id, current_user):
    completion_image_file = request.files.get("completion_image")
    completion_note = request.form.get("completion_note", "")

    if not completion_image_file:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Completed-work resolution proof image is required"
        }), 400

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if completion_image_file.content_type not in allowed_types:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Only JPEG, PNG, or WEBP images are allowed"
        }), 400

    assignment, error = AssignmentService.resolve_assignment(
        assignment_id=assignment_id,
        admin_id=current_user["user_id"],
        completion_image_file=completion_image_file,
        completion_note=completion_note
    )

    if error:
        return jsonify({
            "success": False,
            "status": "error",
            "message": error
        }), 400

    return jsonify({
        "success": True,
        "status": "success",
        "message": "Assignment marked as resolved successfully",
        "report_id": assignment["report_id"],
        "assignment_status": "RESOLVED",
        "complaint_status": "RESOLVED"
    }), 200
