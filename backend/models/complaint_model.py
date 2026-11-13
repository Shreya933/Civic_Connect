
from datetime import datetime, timezone

from bson import ObjectId

from database import complaints_collection
from models.counter_model import CounterModel


class ComplaintModel:

    COLLECTION = complaints_collection

    STATUSES = [
        "PENDING_REVIEW",
        "IN_PROGRESS",
        "RESOLVED",
        "REJECTED"
    ]

    @staticmethod
    def create_indexes():
        ComplaintModel.COLLECTION.create_index(
            "complaint_id",
            unique=True
        )

        ComplaintModel.COLLECTION.create_index(
            [("citizen_id", 1), ("submitted_at", -1)]
        )

        ComplaintModel.COLLECTION.create_index(
            [("status", 1), ("submitted_at", -1)]
        )

        ComplaintModel.COLLECTION.create_index(
            [("city_id", 1), ("status", 1)]
        )

        ComplaintModel.COLLECTION.create_index(
            [("location", "2dsphere")]
        )

    @staticmethod
    def create_complaint(citizen_id, data):
        now = datetime.now(timezone.utc)

        document = {
            "complaint_id": CounterModel.get_next_complaint_id(),

            "citizen_id": ObjectId(citizen_id),

            "title": data.get("title") or f"{data.get('category', 'Civic Infrastructure')} Report",
            "description": data.get("description", ""),

            "source": data["source"],

            "image": {
                "storage_key": data["storage_key"],
                "content_type": data["content_type"],
                "size_bytes": data["size_bytes"],
                "url": data.get("image_url"),
                "thumbnail_url": data.get("thumbnail_url")
            },

            "prediction": {
                "state": data.get("prediction_state", "FAILED"),
                "category": data.get(
                    "category",
                    "UNCLASSIFIED"
                ),
                "confidence": data.get("confidence"),
                "model_version": data.get("model_version"),
                "top_k": data.get("top_k")
            },

            "category_override": None,

            "location": {
                "type": "Point",
                "coordinates": [
                    data["longitude"],
                    data["latitude"]
                ],
                "accuracy_m": data.get("accuracy_m")
            },

            "address": data.get("address"),

            "city_id": data.get("city_id"),

            "submitted_at": now,
            "status": "PENDING_REVIEW",

            "rejection": None,
            "current_assignment_id": None,
            "completed_at": None,

            "created_at": now,
            "updated_at": now
        }

        result = ComplaintModel.COLLECTION.insert_one(document)

        document["_id"] = result.inserted_id

        return document

    @staticmethod
    def get_citizen_complaints(citizen_id):
        return list(
            ComplaintModel.COLLECTION.find(
                {"citizen_id": ObjectId(citizen_id)}
            ).sort("submitted_at", -1)
        )

    @staticmethod
    def get_complaint_by_id(complaint_id, citizen_id):
        return ComplaintModel.COLLECTION.find_one({
            "_id": ObjectId(complaint_id),
            "citizen_id": ObjectId(citizen_id)
        })
