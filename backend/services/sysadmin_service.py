# backend/services/sysadmin_service.py

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


class SysAdminService:
    STAFF_ROLES = {"ADMIN", "MUNICIPAL_ADMIN", "HIGHER_AUTHORITY"}
    USER_STATUSES = {
        "ACTIVE",
        "PENDING_APPROVAL",
        "REJECTED",
        "SUSPENDED",
        "INACTIVE"
    }

    def __init__(self, user_id):
        self.user_id = object_id(user_id)

        user = db.users.find_one({
            "_id": self.user_id,
            "role": "SYSTEM_ADMIN",
            "account_status": "ACTIVE",
        })

        if not user:
            raise Forbidden("Active System Administrator account required")

    def pending_staff(self, page=1, limit=20):
        query = {
            "account_status": "PENDING_APPROVAL",
            "$or": [
                {"role": {"$in": ["ADMIN", "MUNICIPAL_ADMIN", "HIGHER_AUTHORITY"]}},
                {"requested_role": {"$in": ["ADMIN", "MUNICIPAL_ADMIN", "HIGHER_AUTHORITY"]}},
                {"role": {"$ne": "CITIZEN"}}
            ]
        }

        return self._list_users(query, page, limit)

    def all_users(
        self,
        page=1,
        limit=20,
        role=None,
        status=None,
        search=None,
    ):
        query = {}

        if role:
            if role in ("ADMIN", "MUNICIPAL_ADMIN"):
                query["role"] = {"$in": ["ADMIN", "MUNICIPAL_ADMIN"]}
            elif role in {"CITIZEN", "HIGHER_AUTHORITY", "SYSTEM_ADMIN"}:
                query["role"] = role
            else:
                raise BadRequest("Invalid role filter")

        if status:
            if status not in self.USER_STATUSES:
                raise BadRequest("Invalid status filter")
            query["account_status"] = status

        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"employee_id": {"$regex": search, "$options": "i"}},
            ]

        return self._list_users(query, page, limit)

    def approve_staff(self, staff_id, data=None):
        staff_id = object_id(staff_id)
        data = data or {}

        staff = db.users.find_one({
            "_id": staff_id,
            "account_status": "PENDING_APPROVAL",
        })

        if not staff:
            raise NotFound("Pending staff account not found")

        requested_role = (
            data.get("requested_role")
            or staff.get("requested_role")
            or staff.get("role")
            or "MUNICIPAL_ADMIN"
        )

        now = datetime.now(timezone.utc)

        result = db.users.update_one(
            {"_id": staff_id},
            {"$set": {
                "role": requested_role,
                "requested_role": None,
                "account_status": "ACTIVE",
                "email_verified": True,
                "approved_by": self.user_id,
                "approved_at": now,
                "rejection_reason": None,
                "updated_at": now,
            }},
        )

        if result.modified_count != 1:
            raise NotFound("Staff account could not be approved")

        self._record_action(
            event="STAFF_APPROVED",
            target_user_id=staff_id,
            details={
                "approved_role": requested_role,
                "previous_status": staff.get("account_status"),
            },
        )

        return db.users.find_one({"_id": staff_id})

    def reject_staff(self, staff_id, data=None):
        staff_id = object_id(staff_id)
        data = data or {}
        reason = data.get("reason", "Application rejected by System Administrator")

        staff = db.users.find_one({
            "_id": staff_id,
            "account_status": "PENDING_APPROVAL",
        })

        if not staff:
            raise NotFound("Pending staff account not found")

        now = datetime.now(timezone.utc)

        result = db.users.update_one(
            {"_id": staff_id},
            {"$set": {
                "account_status": "REJECTED",
                "email_verified": False,
                "approved_by": None,
                "approved_at": None,
                "rejection_reason": str(reason).strip(),
                "updated_at": now,
            }},
        )

        if result.modified_count != 1:
            raise NotFound("Staff account could not be rejected")

        self._record_action(
            event="STAFF_REJECTED",
            target_user_id=staff_id,
            details={
                "previous_status": staff.get("account_status"),
                "reason": str(reason).strip(),
            },
        )

        return db.users.find_one({"_id": staff_id})

    def set_user_status(self, user_id, data):
        user_id = object_id(user_id)
        status = data.get("account_status") or data.get("status")

        if not status or status not in self.USER_STATUSES:
            raise BadRequest(f"Invalid account_status. Must be one of: {sorted(self.USER_STATUSES)}")

        target_user = db.users.find_one({"_id": user_id})
        if not target_user:
            raise NotFound("User account not found")

        # System Admin cannot deactivate own account
        if target_user["_id"] == self.user_id:
            raise BadRequest("System Administrator cannot deactivate own account")

        now = datetime.now(timezone.utc)
        db.users.update_one(
            {"_id": user_id},
            {"$set": {
                "account_status": status,
                "updated_at": now
            }}
        )

        self._record_action(
            event="USER_STATUS_UPDATED",
            target_user_id=user_id,
            details={
                "previous_status": target_user.get("account_status"),
                "new_status": status
            }
        )

        return db.users.find_one({"_id": user_id})

    def _list_users(self, query, page, limit):
        total = db.users.count_documents(query)
        users = list(
            db.users.find(query, {"password_hash": 0})
            .sort("created_at", -1)
            .skip((page - 1) * limit)
            .limit(limit)
        )

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "users": [
                {
                    "id": str(u["_id"]),
                    "user_id": str(u["_id"]),
                    "full_name": u.get("full_name", ""),
                    "email": u.get("email", ""),
                    "mobile": u.get("mobile", ""),
                    "role": u.get("role", "CITIZEN"),
                    "requested_role": u.get("requested_role"),
                    "designation": u.get("designation"),
                    "department": u.get("department"),
                    "account_status": u.get("account_status", "ACTIVE"),
                    "created_at": u.get("created_at"),
                    "last_login_at": u.get("last_login_at"),
                }
                for u in users
            ]
        }

    def _record_action(self, event, target_user_id, details):
        try:
            db.audit_logs.insert_one({
                "actor_id": self.user_id,
                "event": event,
                "target_user_id": target_user_id,
                "details": details,
                "timestamp": datetime.now(timezone.utc)
            })
        except Exception:
            pass
