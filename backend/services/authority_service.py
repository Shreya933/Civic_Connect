# backend/services/authority_service.py

from datetime import datetime, timezone
from bson import ObjectId
from werkzeug.exceptions import BadRequest, Forbidden, NotFound

from database import db


def object_id(value):
    if not isinstance(value, (str, ObjectId)) or not ObjectId.is_valid(value):
        raise BadRequest("Invalid MongoDB ObjectId")
    return ObjectId(value)


def utc(value):
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def serialize(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return utc(value).isoformat().replace("+00:00", "Z")
    if isinstance(value, dict):
        return {key: serialize(item) for key, item in value.items()}
    if isinstance(value, list):
        return [serialize(item) for item in value]
    return value


class AuthorityService:
    ACTION_TYPES = {
        "EXPLANATION_REQUESTED",
        "WARNING_ISSUED",
        "CORRECTIVE_MEASURE_REQUIRED",
        "PERFORMANCE_REVIEW_INITIATED",
        "PENALTY_INITIATED",
        "OTHER",
    }

    def __init__(self, user_id):
        self.user_id = object_id(user_id)

        user = db.users.find_one({
            "_id": self.user_id,
            "role": "HIGHER_AUTHORITY",
            "account_status": "ACTIVE",
        })

        if not user:
            raise Forbidden("Active Higher Authority account required")

        jurisdiction = user.get("jurisdiction")
        city_filter = {}

        if isinstance(jurisdiction, dict):
            city_id = jurisdiction.get("city_id")
            state = jurisdiction.get("state")
            district = jurisdiction.get("district")
            if city_id and ObjectId.is_valid(str(city_id)):
                city_filter = {"_id": object_id(city_id)}
            elif state and district:
                city_filter = {"state": state, "district": district}
        elif isinstance(jurisdiction, str) and ObjectId.is_valid(jurisdiction):
            city_filter = {"_id": ObjectId(jurisdiction)}

        # Find cities matching filter if any
        if city_filter and db.cities.count_documents(city_filter) > 0:
            self.city_ids = [
                city["_id"]
                for city in db.cities.find(city_filter, {"_id": 1})
            ]
        else:
            self.city_ids = [city["_id"] for city in db.cities.find({}, {"_id": 1})]

        # Load departments
        if self.city_ids:
            self.complaint_filter = {"city_id": {"$in": self.city_ids}}
            self.departments = list(
                db.departments.find({
                    "$or": [
                        {"city_id": {"$in": self.city_ids}},
                        {"is_active": True}
                    ]
                })
            )
        else:
            self.complaint_filter = {}
            self.departments = list(db.departments.find({"is_active": True}))
            if not self.departments:
                self.departments = list(db.departments.find({}))

        self.department_ids = [item["_id"] for item in self.departments]
        if self.department_ids:
            self.assignment_filter = {"department_id": {"$in": self.department_ids}}
        else:
            self.assignment_filter = {}

    @staticmethod
    def currently_overdue(assignment, now):
        if not assignment.get("deadline_at"):
            return False
        return (
            assignment.get("is_active") is True
            and assignment.get("status") in {"IN_PROGRESS", "OVERDUE"}
            and utc(assignment["deadline_at"]) < now
        )

    @staticmethod
    def ever_overdue(assignment, now):
        if not assignment.get("deadline_at"):
            return False
        completed_at = utc(assignment.get("completed_at"))
        deadline_at = utc(assignment["deadline_at"])

        return (
            assignment.get("was_overdue") is True
            or (
                assignment.get("status") == "RESOLVED"
                and completed_at is not None
                and completed_at > deadline_at
            )
            or AuthorityService.currently_overdue(assignment, now)
        )

    def dashboard(self):
        now = datetime.now(timezone.utc)

        pipeline = []
        if self.complaint_filter:
            pipeline.append({"$match": self.complaint_filter})
        pipeline.append({"$group": {"_id": "$status", "count": {"$sum": 1}}})

        counts = {
            row["_id"]: row["count"]
            for row in db.complaints.aggregate(pipeline)
        }

        assignments = list(db.assignments.find(self.assignment_filter))

        current = sum(
            self.currently_overdue(item, now) for item in assignments
        )
        historical = sum(
            self.ever_overdue(item, now) for item in assignments
        )

        return {
            "total_complaints": sum(counts.values()),
            "pending_review": counts.get("PENDING_REVIEW", 0),
            "in_progress": counts.get("IN_PROGRESS", 0),
            "resolved": counts.get("RESOLVED", 0),
            "rejected": counts.get("REJECTED", 0),
            "complaints_status_overdue": counts.get("OVERDUE", 0),
            "currently_overdue_assignments": current,
            "historical_overdue_assignments": historical,
            "departments": len(self.departments),
            "generated_at": now,
        }

    def department_performance(self):
        now = datetime.now(timezone.utc)

        grouped = {}
        for item in db.assignments.find(self.assignment_filter):
            dept_key = str(item.get("department_id", "unassigned"))
            grouped.setdefault(dept_key, []).append(item)

        results = []

        for department in self.departments:
            dept_id_str = str(department["_id"])
            assignments = grouped.get(dept_id_str, [])
            resolved = [
                item for item in assignments
                if item.get("status") == "RESOLVED"
            ]

            on_time = sum(
                utc(item["completed_at"]) <= utc(item["deadline_at"])
                for item in resolved
                if item.get("completed_at") and item.get("deadline_at")
            )

            results.append({
                "department_id": str(department["_id"]),
                "department_name": department.get("name", "Unnamed Department"),
                "is_active": department.get("is_active", True),
                "total_assignments": len(assignments),
                "resolved": len(resolved),
                "active_assignments": sum(
                    item.get("is_active") is True for item in assignments
                ),
                "currently_overdue": sum(
                    self.currently_overdue(item, now)
                    for item in assignments
                ),
                "historical_overdue": sum(
                    self.ever_overdue(item, now)
                    for item in assignments
                ),
                "resolved_on_time": on_time,
                "resolution_rate_percent": round(
                    len(resolved) / len(assignments) * 100, 2
                ) if assignments else 0,
                "on_time_resolution_rate_percent": round(
                    on_time / len(resolved) * 100, 2
                ) if resolved else 0,
            })

        return results

    def overdue_reports(self, historical=False, page=1, limit=20):
        now = datetime.now(timezone.utc)
        predicate = self.ever_overdue if historical else self.currently_overdue

        matches = [
            item
            for item in db.assignments.find(
                self.assignment_filter
            ).sort("deadline_at", 1)
            if predicate(item, now)
        ]

        selected = matches[(page - 1) * limit:page * limit]
        department_names = {
            str(item["_id"]): item.get("name", "Department") for item in self.departments
        }

        complaint_ids = [item["complaint_id"] for item in selected if item.get("complaint_id")]
        complaints = {
            item["_id"]: item
            for item in db.complaints.find(
                {"_id": {"$in": complaint_ids}},
                {"complaint_id": 1, "address": 1, "status": 1, "prediction": 1},
            )
        }

        reports = []

        for item in selected:
            complaint = complaints.get(item.get("complaint_id"), {})
            deadline = utc(item.get("deadline_at")) or now
            end = utc(item.get("completed_at")) or now
            seconds_late = max(0, (end - deadline).total_seconds())

            dept_id = str(item.get("department_id", ""))
            reports.append({
                "assignment_id": str(item["_id"]),
                "report_id": item.get("report_id", f"REP-{str(item['_id'])[:8]}"),
                "complaint_object_id": str(item.get("complaint_id", "")),
                "complaint_id": complaint.get("complaint_id", "N/A"),
                "category": complaint.get("prediction", {}).get("category", "Infrastructure Issue"),
                "address": complaint.get("address", "Municipal Ward"),
                "department_id": dept_id,
                "department_name": department_names.get(dept_id, "Public Works"),
                "status": item.get("status", "OVERDUE"),
                "deadline_at": item.get("deadline_at"),
                "completed_at": item.get("completed_at"),
                "was_overdue": True,
                "hours_late": round(seconds_late / 3600, 1),
            })

        return {
            "total": len(matches),
            "page": page,
            "limit": limit,
            "reports": reports,
        }

    def create_action(self, data):
        action_type = data.get("action_type")
        if action_type not in self.ACTION_TYPES:
            raise BadRequest(f"action_type must be one of {sorted(self.ACTION_TYPES)}")

        department_id = data.get("department_id")
        department = None
        if department_id:
            department = db.departments.find_one({"_id": object_id(department_id)})
            if not department:
                raise BadRequest("Specified department does not exist")

        remarks = data.get("remarks")
        if not remarks or not isinstance(remarks, str) or len(remarks.strip()) < 5:
            raise BadRequest("Remarks must contain at least 5 characters")

        now = datetime.now(timezone.utc)
        document = {
            "authority_id": self.user_id,
            "action_type": action_type,
            "department_id": department["_id"] if department else None,
            "department_name": department.get("name") if department else "Citywide",
            "remarks": remarks.strip(),
            "status": "OPEN",
            "created_at": now,
            "updated_at": now,
            "closed_at": None,
        }

        result = db.admin_actions.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    def list_actions(self, page=1, limit=20):
        total = db.admin_actions.count_documents({})
        actions = list(
            db.admin_actions.find({})
            .sort("created_at", -1)
            .skip((page - 1) * limit)
            .limit(limit)
        )
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "actions": actions,
        }

    def close_action(self, action_id):
        action_id = object_id(action_id)
        now = datetime.now(timezone.utc)
        result = db.admin_actions.update_one(
            {"_id": action_id, "status": "OPEN"},
            {"$set": {"status": "CLOSED", "closed_at": now, "updated_at": now}}
        )
        if result.modified_count == 0:
            raise NotFound("Open administrative action not found")
        return db.admin_actions.find_one({"_id": action_id})
