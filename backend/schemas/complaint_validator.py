# backend/schemas/complaint_validator.py

ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
]

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_complaint_creation(data, file):
    errors = []

    if file is None or not getattr(file, "filename", None):
        errors.append("Complaint image is required")
    else:
        ctype = getattr(file, "content_type", "")
        fn = file.filename.lower()
        valid_ext = any(fn.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])

        if ctype not in ALLOWED_IMAGE_TYPES and not valid_ext:
            errors.append("Only JPEG, PNG, or WEBP images are allowed")

        try:
            file.seek(0, 2)
            size = file.tell()
            file.seek(0)
            if size > MAX_IMAGE_SIZE:
                errors.append("Image size must be less than 10 MB")
        except Exception:
            pass

    lat = data.get("latitude")
    if not lat:
        errors.append("Latitude is required")
    else:
        try:
            lat_f = float(lat)
            if not -90 <= lat_f <= 90:
                errors.append("Latitude must be between -90 and 90")
        except (ValueError, TypeError):
            errors.append("Valid latitude is required")

    lng = data.get("longitude")
    if not lng:
        errors.append("Longitude is required")
    else:
        try:
            lng_f = float(lng)
            if not -180 <= lng_f <= 180:
                errors.append("Longitude must be between -180 and 180")
        except (ValueError, TypeError):
            errors.append("Valid longitude is required")

    source = str(data.get("source", "UPLOAD")).strip().upper()
    if source not in ["CAPTURE", "UPLOAD"]:
        errors.append("Source must be CAPTURE or UPLOAD")

    return errors
