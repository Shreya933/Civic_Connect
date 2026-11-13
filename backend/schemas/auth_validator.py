# backend/schemas/auth_validator.py

import re

EMAIL_REGEX = r"^[\w\.\+\-]+@[\w\-]+\.[\w\.]+$"
MOBILE_REGEX = r"^[6-9]\d{9}$"


def validate_citizen_registration(data):
    errors = []

    full_name = data.get("full_name") or data.get("fullName")
    if not full_name or not str(full_name).strip():
        errors.append("Full name is required")

    email = data.get("email", "").strip()
    if not re.match(EMAIL_REGEX, email):
        errors.append("Valid email is required")

    mobile = data.get("mobile", "").strip()
    # Accept 10-digit mobile or standard format
    if not re.match(r"^\+?\d{10,13}$", mobile):
        errors.append("Valid 10-digit mobile number is required")

    password = data.get("password", "")

    if len(password) < 6:
        errors.append("Password must be at least 6 characters")

    return errors
