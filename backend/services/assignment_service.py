# backend/services/assignment_service.py

from datetime import datetime, timezone

from bson import ObjectId

from models.assignment_model import AssignmentModel
from models.complaint_model import ComplaintModel
from models.department_model import DepartmentModel
from models.status_history_model import StatusHistoryModel
from models.admin_action_model import AdminActionModel
from services.imagekit_service import ImageKitService


class AssignmentService:

    imagekit = ImageKitService()

    @staticmethod
    def approve_and_assign(
        complaint_id,
        admin_id,
        data
    ):
        complaint = ComplaintModel.COLLECTION.find_one({
            "_id": ObjectId(complaint_id),
            "status": "PENDING_REVIEW"
        })

        if not complaint:
            return None, "Complaint not found or already reviewed"

        department = DepartmentModel.get_department_by_id(
            data["department_id"]
        )

        if not department:
            return None, "Department not found"

        deadline_at = datetime.fromisoformat(
            data["deadline"].replace("Z", "+00:00")
        )

        assignment = AssignmentModel.create_assignment(
            complaint=complaint,
            department=department,
            assigned_by_id=admin_id,
            worker_count=data["worker_count"],
            deadline_at=deadline_at
        )

        ComplaintModel.COLLECTION.update_one(
            {"_id": complaint["_id"]},
            {"$set": {
                "status": "IN_PROGRESS",
                "current_assignment_id": assignment["_id"],
                "updated_at": datetime.now(timezone.utc)
            }}
        )

        StatusHistoryModel.add_history(
            entity_type="COMPLAINT",
            entity_id=str(complaint["_id"]),

            from_status="PENDING_REVIEW",
            to_status="IN_PROGRESS",

            actor_type="USER",
            actor_user_id=admin_id,

            reason="Complaint approved and assigned to department",

            details={
                "assignment_id": str(assignment["_id"]),
                "report_id": assignment["report_id"],
                "department_id": str(department["_id"]),
                "department_name": department["name"],
                "worker_count": int(data["worker_count"]),
                "deadline_at": deadline_at.isoformat()
            }
        )

        AdminActionModel.add_action(
            authority_id=admin_id,
            department_id=str(department["_id"]),

            action_type="COMPLAINT_APPROVED",
            reason="Complaint approved and work assigned",

            related_complaint_id=str(complaint["_id"]),
            related_assignment_id=str(assignment["_id"]),

            metrics_snapshot={
                "worker_count": int(data["worker_count"]),
                "deadline_at": deadline_at.isoformat()
            }
        )

        return assignment, None

    @staticmethod
    def reject_complaint(
        complaint_id,
        admin_id,
        reason
    ):
        complaint = ComplaintModel.COLLECTION.find_one({
            "_id": ObjectId(complaint_id),
            "status": "PENDING_REVIEW"
        })

        if not complaint:
            return None, "Complaint not found or already reviewed"

        now = datetime.now(timezone.utc)

        ComplaintModel.COLLECTION.update_one(
            {"_id": complaint["_id"]},
            {"$set": {
                "status": "REJECTED",

                "rejection": {
                    "reason": reason,
                    "rejected_by": ObjectId(admin_id),
                    "rejected_at": now
                },

                "updated_at": now
            }}
        )

        StatusHistoryModel.add_history(
            entity_type="COMPLAINT",
            entity_id=str(complaint["_id"]),

            from_status="PENDING_REVIEW",
            to_status="REJECTED",

            actor_type="USER",
            actor_user_id=admin_id,

            reason=reason
        )

        AdminActionModel.add_action(
            authority_id=admin_id,
            department_id=None,

            action_type="COMPLAINT_REJECTED",
            reason=reason,

            related_complaint_id=str(complaint["_id"])
        )

        return complaint, None

    @staticmethod
    def resolve_assignment(
        assignment_id,
        admin_id,
        completion_image_file,
        completion_note
    ):
        assignment = AssignmentModel.get_assignment_by_id(
            assignment_id
        )

        if not assignment:
            return None, "Assignment not found"

        if assignment["status"] == "RESOLVED":
            return None, "Assignment is already resolved"

        uploaded_completion = AssignmentService.imagekit.upload_completion_image(
            completion_image_file
        )

        completion_image = {
            "storage_key": uploaded_completion["storage_key"],
            "content_type": uploaded_completion["content_type"],
            "size_bytes": uploaded_completion["size_bytes"],
            "url": uploaded_completion["url"],
            "thumbnail_url": uploaded_completion["thumbnail_url"]
        }

        now = datetime.now(timezone.utc)

        deadline_met = AssignmentModel.mark_resolved(
            assignment=assignment,
            admin_id=admin_id,
            completion_image=completion_image,
            completion_note=completion_note
        )

        ComplaintModel.COLLECTION.update_one(
            {"_id": assignment["complaint_id"]},
            {"$set": {
                "status": "RESOLVED",
                "completed_at": now,
                "updated_at": now
            }}
        )

        StatusHistoryModel.add_history(
            entity_type="ASSIGNMENT",
            entity_id=str(assignment["_id"]),

            from_status=assignment["status"],
            to_status="RESOLVED",

            actor_type="USER",
            actor_user_id=admin_id,

            reason=completion_note or "Work marked as resolved",

            details={
                "complaint_id": str(assignment["complaint_id"]),
                "report_id": assignment["report_id"],
                "deadline_met": deadline_met,
                "was_overdue": assignment["was_overdue"],
                "completion_image_url": completion_image["url"],
                "completed_at": now.isoformat()
            }
        )

        AdminActionModel.add_action(
            authority_id=admin_id,
            department_id=str(assignment["department_id"]),

            action_type="ASSIGNMENT_RESOLVED",
            reason=completion_note or "Work marked as resolved",

            related_complaint_id=str(assignment["complaint_id"]),
            related_assignment_id=str(assignment["_id"]),

            metrics_snapshot={
                "deadline_met": deadline_met,
                "was_overdue": assignment["was_overdue"]
            }
        )

        return assignment, None