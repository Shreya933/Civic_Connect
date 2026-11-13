# backend/models/status_history_model.py

from datetime import datetime, timezone

from bson import ObjectId

from database import status_history_collection


class StatusHistoryModel:
    COLLECTION = status_history_collection

    @staticmethod
    def create_indexes():
        StatusHistoryModel.COLLECTION.create_index(
            [("entity_type", 1), ("entity_id", 1), ("at", 1)]
        )

    @staticmethod
    def add_history(
        entity_type,
        entity_id,
        to_status,
        actor_type="USER",
        actor_user_id=None,
        from_status=None,
        reason=None,
        details=None
    ):
        document = {
            "entity_type": entity_type,
            "entity_id": ObjectId(entity_id),
            "from_status": from_status,
            "to_status": to_status,
            "at": datetime.now(timezone.utc),

            "actor": {
                "type": actor_type,
                "user_id": ObjectId(actor_user_id)
                if actor_user_id else None
            },

            "reason": reason,
            "details": details
        }

        result = StatusHistoryModel.COLLECTION.insert_one(document)
        document["_id"] = result.inserted_id
        return document