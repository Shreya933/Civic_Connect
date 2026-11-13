# backend/routes/citizen_routes.py

from flask import Blueprint, request, jsonify

from models.complaint_model import ComplaintModel
from schemas.complaint_validator import validate_complaint_creation
from services.complaint_service import ComplaintService
from utils.security import citizen_required

citizen_bp = Blueprint("citizen_bp", __name__)

complaint_service = ComplaintService()


@citizen_bp.route("/complaints", methods=["POST"])
@citizen_required
def create_complaint(current_user):
    data = request.form.to_dict()
    image_file = request.files.get("image")

    errors = validate_complaint_creation(data, image_file)

    if errors:
        return jsonify({
            "success": False,
            "status": "error",
            "message": errors[0] if errors else "Validation failed",
            "errors": errors
        }), 400

    try:
        complaint = complaint_service.create_complaint(
            citizen_id=current_user["user_id"],
            data=data,
            image_file=image_file
        )

        return jsonify({
            "success": True,
            "status": "success",
            "message": "Complaint submitted successfully",
            "complaint_id": complaint["complaint_id"],
            "prediction": complaint.get("prediction"),
            "status": complaint.get("status", "PENDING_REVIEW"),
            "data": {
                "id": str(complaint.get("_id", "")),
                "complaint_id": complaint["complaint_id"],
                "title": complaint.get("title", ""),
                "description": complaint.get("description", ""),
                "category": complaint.get("prediction", {}).get("category", "General Civic Issue"),
                "status": complaint.get("status", "PENDING_REVIEW"),
                "address": complaint.get("address", ""),
                "image_url": complaint.get("image", {}).get("url"),
                "prediction": complaint.get("prediction"),
            }
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "status": "error",
            "message": str(e) or "Failed to submit civic complaint"
        }), 500


@citizen_bp.route("/complaints", methods=["GET"])
@citizen_required
def get_my_complaints(current_user):
    complaints = ComplaintModel.get_citizen_complaints(
        current_user["user_id"]
    )

    return jsonify({
        "success": True,
        "status": "success",
        "count": len(complaints),
        "complaints": [
            {
                "id": str(complaint["_id"]),
                "complaint_id": complaint["complaint_id"],
                "title": complaint.get("title", ""),
                "description": complaint.get("description", ""),
                "category": complaint.get("prediction", {}).get("category", "General Civic Issue"),
                "ai_state": complaint.get("prediction", {}).get("state"),
                "confidence": complaint.get("prediction", {}).get("confidence", 0.9),
                "image_url": complaint.get("image", {}).get("url"),
                "thumbnail_url": complaint.get("image", {}).get("thumbnail_url"),
                "address": complaint.get("address"),
                "location": complaint.get("location"),
                "status": complaint.get("status", "PENDING_REVIEW"),
                "submitted_at": complaint.get("submitted_at")
            }
            for complaint in complaints
        ]
    }), 200


@citizen_bp.route("/complaints/<complaint_id>", methods=["GET"])
@citizen_required
def get_complaint_details(complaint_id, current_user):
    complaint = ComplaintModel.get_complaint_by_id(
        complaint_id,
        current_user["user_id"]
    )

    if not complaint:
        return jsonify({
            "success": False,
            "status": "error",
            "message": "Complaint not found or unauthorized access"
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
            "title": complaint.get("title", f"Complaint {complaint['complaint_id']}"),
            "description": complaint.get("description", "")
        }
    }), 200
