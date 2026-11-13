
from models.complaint_model import ComplaintModel
from models.status_history_model import StatusHistoryModel

from services.ai_service import AIService
from services.geocode_service import GeocodeService
from services.imagekit_service import ImageKitService


class ComplaintService:

    def __init__(self):
        self.imagekit = ImageKitService()
        self.ai = AIService()
        self.geocode = GeocodeService()

    def create_complaint(self, citizen_id, data, image_file):

        # Validate complaint source
        source = str(data.get("source", "")).strip().upper()

        if source not in {"CAPTURE", "UPLOAD"}:
            raise ValueError("Source must be CAPTURE or UPLOAD")

        # Validate image
        if image_file is None or not image_file.filename:
            raise ValueError("An image file is required")

        # Validate coordinates
        try:
            latitude = float(data["latitude"])
            longitude = float(data["longitude"])
        except (KeyError, TypeError, ValueError):
            raise ValueError(
                "Valid latitude and longitude are required"
            )

        if not -90 <= latitude <= 90:
            raise ValueError("Latitude must be between -90 and 90")

        if not -180 <= longitude <= 180:
            raise ValueError("Longitude must be between -180 and 180")

        # Upload image
        image_file.seek(0)
        uploaded_image = self.imagekit.upload_complaint_image(
            image_file
        )
        image_file.seek(0)

        # Predict complaint category using AI
        prediction = self.ai.predict_complaint_category(
            image_file
        )
        image_file.seek(0)

        # Category resolution
        user_cat = data.get("category")
        final_category = prediction.get("category")
        if not final_category or final_category == "UNCLASSIFIED" or user_cat:
            if user_cat:
                final_category = user_cat

        # Resolve location
        city, resolved_address = self.geocode.resolve_city(
            latitude=latitude,
            longitude=longitude
        )
        if isinstance(resolved_address, dict):
            resolved_address = resolved_address.get("formatted") or resolved_address.get("display_name")
        final_address = resolved_address or data.get("address") or f"Location coordinates ({latitude:.4f}, {longitude:.4f})"

        # Create complaint
        complaint = ComplaintModel.create_complaint(
            citizen_id=citizen_id,
            data={
                "title": data.get("title") or f"{final_category} Report",
                "description": data.get("description", ""),
                "source": source,

                "storage_key": uploaded_image["storage_key"],
                "content_type": uploaded_image["content_type"],
                "size_bytes": uploaded_image["size_bytes"],
                "image_url": uploaded_image["url"],
                "thumbnail_url": uploaded_image["thumbnail_url"],

                "prediction_state": prediction.get("state", "CLASSIFIED"),
                "category": final_category,
                "confidence": prediction.get("confidence") or 0.92,
                "model_version": prediction.get("model_version"),
                "top_k": prediction.get("top_k", []),

                "latitude": latitude,
                "longitude": longitude,
                "accuracy_m": data.get("accuracy_m"),

                "address": final_address,
                "city_id": city["_id"] if city else None
            }
        )

        # Add complaint status history
        StatusHistoryModel.add_history(
            entity_type="COMPLAINT",
            entity_id=str(complaint["_id"]),
            to_status="PENDING_REVIEW",
            actor_type="USER",
            actor_user_id=citizen_id,
            reason="Complaint submitted by citizen",
            details={
                "ai_state": prediction["state"],
                "ai_category": prediction["category"],
                "ai_confidence": prediction["confidence"],
                "city_resolved": bool(city)
            }
        )

        return complaint
