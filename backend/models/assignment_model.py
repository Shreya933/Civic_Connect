# backend/models/assignment_model.py

from datetime import datetime, timezone

from bson import ObjectId

from database import assignments_collection
from models.counter_model import CounterModel


class AssignmentModel:
    COLLECTION = assignments_collection

    STATUSES = [
        "IN_PROGRESS",
        "OVERDUE",
        "RESOLVED"
    ]

    @staticmethod
    def create_indexes():
        AssignmentModel.COLLECTION.create_index(
            "report_id",
            unique=True
        )

        AssignmentModel.COLLECTION.create_index(
            "complaint_id",
            unique=True,
            partialFilterExpression={"is_active": True}
        )

        AssignmentModel.COLLECTION.create_index(
            [("status", 1), ("deadline_at", 1)]
        )

        AssignmentModel.COLLECTION.create_index(
            [("department_id", 1), ("status", 1)]
        )

        AssignmentModel.COLLECTION.create_index(
            [("was_overdue", 1), ("department_id", 1)]
        )

        AssignmentModel.COLLECTION.create_index(
            "was_overdue"
        )

    @staticmethod
    def create_assignment(
        complaint,
        department,
        assigned_by_id,
        worker_count,
        deadline_at
    ):
        now = datetime.now(timezone.utc)

        document = {
            "report_id": CounterModel.get_next_report_id(),

            "complaint_id": complaint["_id"],
            "department_id": department["_id"],

            "worker_count": int(worker_count),

            "assigned_at": now,
            "assigned_by": ObjectId(assigned_by_id),

            "deadline_at": deadline_at,

            "status": "IN_PROGRESS",
            "is_active": True,

            "was_overdue": False,
            "first_overdue_at": None,

            "completed_at": None,
            "completed_by": None,
            "completion_image": None,
            "completion_note": None,
            "deadline_met": None,

            "created_at": now,
            "updated_at": now
        }

        result = AssignmentModel.COLLECTION.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    @staticmethod
    def get_assignment_by_id(assignment_id):
        if not assignment_id:
            return None
        # Try ObjectId
        try:
            if ObjectId.is_valid(str(assignment_id)):
                doc = AssignmentModel.COLLECTION.find_one({"_id": ObjectId(assignment_id)})
                if doc:
                    return doc
        except Exception:
            pass

        # Try report_id
        doc = AssignmentModel.COLLECTION.find_one({"report_id": str(assignment_id)})
        if doc:
            return doc

        # Try complaint_id
        try:
            if ObjectId.is_valid(str(assignment_id)):
                doc = AssignmentModel.COLLECTION.find_one({"complaint_id": ObjectId(assignment_id)})
                if doc:
                    return doc
        except Exception:
            pass

        return AssignmentModel.COLLECTION.find_one({"complaint_id": str(assignment_id)})

    @staticmethod
    def get_in_progress_assignments():
        return list(
            AssignmentModel.COLLECTION.find({
                "status": "IN_PROGRESS"
            }).sort("deadline_at", 1)
        )

    @staticmethod
    def get_resolved_assignments():
        return list(
            AssignmentModel.COLLECTION.find({
                "status": "RESOLVED"
            }).sort("completed_at", -1)
        )

    @staticmethod
    def mark_resolved(
        assignment,
        admin_id,
        completion_image,
        completion_note
    ):
        now = datetime.now(timezone.utc)

        deadline_met = now <= assignment["deadline_at"]

        AssignmentModel.COLLECTION.update_one(
            {"_id": assignment["_id"]},
            {"$set": {
                "status": "RESOLVED",
                "is_active": False,

                "completed_at": now,
                "completed_by": ObjectId(admin_id),

                "completion_image": completion_image,
                "completion_note": completion_note,

                "deadline_met": deadline_met,

                "updated_at": now
            }}
        )

        return deadline_met
