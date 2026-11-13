# backend/models/admin_action_model.py

from datetime import datetime, timezone

from bson import ObjectId

from database import admin_actions_collection


class AdminActionModel:
    COLLECTION = admin_actions_collection

    ACTION_TYPES = [
        "COMPLAINT_APPROVED",
        "COMPLAINT_REJECTED",
        "ASSIGNMENT_CREATED",
        "ASSIGNMENT_RESOLVED",
        "EXPLANATION_REQUESTED",
        "WARNING_ISSUED",
        "CORRECTIVE_MEASURE_REQUIRED",
        "PERFORMANCE_REVIEW_INITIATED",
        "OTHER"
    ]

    @staticmethod
    def create_indexes():
        AdminActionModel.COLLECTION.create_index(
            [("department_id", 1), ("action_date", -1)]
        )

        AdminActionModel.COLLECTION.create_index(
            [("authority_id", 1), ("action_date", -1)]
        )

        AdminActionModel.COLLECTION.create_index(
            "related_complaint_id"
        )

        AdminActionModel.COLLECTION.create_index(
            "related_assignment_id"
        )

    @staticmethod
    def add_action(
        authority_id,
        department_id,
        action_type,
        reason,
        related_complaint_id=None,
        related_assignment_id=None,
        metrics_snapshot=None,
        outcome=None
    ):
        now = datetime.now(timezone.utc)

        document = {
            "authority_id": ObjectId(authority_id),
            "department_id": ObjectId(department_id),

            "action_type": action_type,
            "reason": reason,

            "related_complaint_id": ObjectId(related_complaint_id)
            if related_complaint_id else None,

            "related_assignment_id": ObjectId(related_assignment_id)
            if related_assignment_id else None,

            "metrics_snapshot": metrics_snapshot,

            "action_date": now,

            "outcome": outcome,
            "outcome_updated_at": None,

            "status": "OPEN",

            "created_at": now,
            "updated_at": now
        }

        result = AdminActionModel.COLLECTION.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    @staticmethod
    def get_actions_by_department(department_id):
        return list(
            AdminActionModel.COLLECTION.find({
                "department_id": ObjectId(department_id)
            }).sort("action_date", -1)
        )