# backend/schemas/assignment_validator.py

from datetime import datetime


def validate_assignment(data):
    errors = []

    if not data.get("department_id"):
        errors.append("Department is required")

    worker_count = data.get("worker_count")

    if not worker_count:
        errors.append("Worker count is required")

    else:
        try:
            if int(worker_count) < 1:
                errors.append("Worker count must be at least 1")
        except ValueError:
            errors.append("Worker count must be a number")

    if not data.get("deadline"):
        errors.append("Deadline is required")

    else:
        try:
            deadline = datetime.fromisoformat(
                data["deadline"].replace("Z", "+00:00")
            )
        except ValueError:
            errors.append("Deadline must be a valid date-time")

    return errors