# backend/models/department_model.py

from datetime import datetime, timezone

from database import departments_collection


class DepartmentModel:
    COLLECTION = departments_collection

    @staticmethod
    def create_indexes():
        DepartmentModel.COLLECTION.create_index(
            ["city_id", "name"],
            unique=True
        )

    @staticmethod
    def get_all_departments():
        return list(
            DepartmentModel.COLLECTION.find(
                {"is_active": True}
            ).sort("name", 1)
        )

    @staticmethod
    def get_department_by_id(department_id):
        from bson import ObjectId

        return DepartmentModel.COLLECTION.find_one({
            "_id": ObjectId(department_id),
            "is_active": True
        })