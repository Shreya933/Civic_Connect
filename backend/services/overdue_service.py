# backend/services/overdue_service.py

from datetime import datetime, timezone

from bson import ObjectId

from models.assignment_model import AssignmentModel
from models.complaint_model import ComplaintModel
from models.status_history_model import StatusHistoryModel


class OverdueService:

    @staticmethod
    def check_and_mark_overdue_assignments():
        """
        Finds all active assignments whose deadline has passed,
        marks them overdue, updates the related complaint,
        and preserves overdue history.
        """

        now = datetime.now(timezone.utc)

        overdue_assignments = list(
            AssignmentModel.COLLECTION.find({
                "status": "IN_PROGRESS",
                "is_active": True,
                "was_overdue": False,
                "deadline_at": {"$lt": now}
            })
        )

        marked_count = 0

        for assignment in overdue_assignments:
            assignment_id = assignment["_id"]
            complaint_id = assignment["complaint_id"]

            # Mark assignment overdue
            AssignmentModel.COLLECTION.update_one(
                {"_id": assignment_id},
                {"$set": {
                    "status": "OVERDUE",
                    "was_overdue": True,
                    "first_overdue_at": now,
                    "updated_at": now
                }}
            )

            # Update related complaint overdue state
            ComplaintModel.COLLECTION.update_one(
                {"_id": complaint_id},
                {"$set": {
                    "is_overdue": True,
                    "overdue_count": complaint.get("overdue_count", 0) + 1,
                    "updated_at": now
                }}
            )

            # Preserve overdue history
            StatusHistoryModel.add_history(
                entity_type="ASSIGNMENT",
                entity_id=str(assignment_id),

                from_status="IN_PROGRESS",
                to_status="OVERDUE",

                actor_type="SYSTEM",
                actor_user_id=None,

                reason="Assignment deadline passed without resolution",

                details={
                    "complaint_id": str(complaint_id),
                    "report_id": assignment["report_id"],
                    "department_id": str(assignment["department_id"]),
                    "deadline_at": assignment["deadline_at"].isoformat(),
                    "marked_overdue_at": now.isoformat()
                }
            )

            marked_count += 1

        return {
            "checked_at": now,
            "assignments_checked": len(overdue_assignments),
            "assignments_marked_overdue": marked_count
        }

    @staticmethod
    def get_overdue_assignments():
        """
        Returns all assignments currently overdue.
        """

        return list(
            AssignmentModel.COLLECTION.find({
                "status": "OVERDUE"
            }).sort("deadline_at", 1)
        )

    @staticmethod
    def get_historical_overdue_assignments():
        """
        Returns all assignments that were overdue at any time,
        including those later resolved.
        """

        return list(
            AssignmentModel.COLLECTION.find({
                "was_overdue": True
            }).sort("first_overdue_at", -1)
        )