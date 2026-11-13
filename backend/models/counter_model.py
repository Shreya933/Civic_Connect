# backend/models/counter_model.py

from datetime import datetime, timezone

from database import counters_collection


class CounterModel:
    COLLECTION = counters_collection

    @staticmethod
    def get_next_sequence(counter_name):
        result = CounterModel.COLLECTION.find_one_and_update(
            {"_id": counter_name},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=True
        )

        return result["seq"]

    @staticmethod
    def get_next_complaint_id():
        year = datetime.now(timezone.utc).year

        sequence = CounterModel.get_next_sequence(
            f"complaint-{year}"
        )

        return f"CC-{year}-{sequence:06d}"

    @staticmethod
    def get_next_report_id():
        year = datetime.now(timezone.utc).year

        sequence = CounterModel.get_next_sequence(
            f"report-{year}"
        )

        return f"RPT-{year}-{sequence:06d}"

    @staticmethod
    def get_next_action_id():
        year = datetime.now(timezone.utc).year

        sequence = CounterModel.get_next_sequence(
            f"admin-action-{year}"
        )

        return f"ACT-{year}-{sequence:06d}"