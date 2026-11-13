# backend/services/geocode_service.py

import os
import time

import requests
from werkzeug.exceptions import ServiceUnavailable


class GeocodeService:
    def __init__(self):
        self.base_url = os.getenv(
            "NOMINATIM_BASE_URL",
            "https://nominatim.openstreetmap.org"
        )

        self.headers = {
            "User-Agent": "CivicConnect-App/2.0 (contact: admin@civic.test)"
        }

    def reverse_geocode(self, latitude, longitude):
        try:
            response = requests.get(
                f"{self.base_url}/reverse",
                params={
                    "lat": latitude,
                    "lon": longitude,
                    "format": "jsonv2",
                    "addressdetails": 1,
                    "zoom": 18,
                },
                headers=self.headers,
                timeout=10,
            )

            response.raise_for_status()
            data = response.json()

        except Exception as error:
            print("Geocoding failed:", error)
            return None

        address = data.get("address", {})

        return {
            "formatted": data.get("display_name"),
            "locality": (
                address.get("suburb")
                or address.get("neighbourhood")
                or address.get("village")
                or address.get("town")
            ),
            "city": (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("municipality")
            ),
            "district": (
                address.get("district")
                or address.get("county")
            ),
            "state": address.get("state"),
            "pincode": address.get("postcode"),
        }

    def resolve_city(self, latitude, longitude):
        """
        Returns a city document from the cities collection.
        Creates the city if it does not already exist.
        """

        from database import db

        address = self.reverse_geocode(latitude, longitude)

        if not address or not address.get("city"):
            return None, address

        city_name = address["city"]
        state = address.get("state", "Unknown")
        district = address.get("district", "Unknown")

        city = db.cities.find_one({
            "name": city_name,
            "state": state,
            "district": district,
        })

        if city:
            return city, address

        now = datetime_utc_now()

        result = db.cities.insert_one({
            "name": city_name,
            "state": state,
            "district": district,
            "timezone": "Asia/Kolkata",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        })

        city = db.cities.find_one({
            "_id": result.inserted_id
        })

        return city, address


def datetime_utc_now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)