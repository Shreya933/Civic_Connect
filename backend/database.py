
# backend/database.py

import os
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "civic_connect")

if not MONGO_URI:
    raise ValueError("MONGO_URI is missing in .env")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    tlsDisableOCSPEndpointCheck=True,
    serverSelectionTimeoutMS=15000,
)

db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
departments_collection = db["departments"]
complaints_collection = db["complaints"]
assignments_collection = db["assignments"]
status_history_collection = db["status_history"]
admin_actions_collection = db["admin_actions"]
otp_challenges_collection = db["otp_challenges"]
refresh_tokens_collection = db["refresh_tokens"]
audit_logs_collection = db["audit_logs"]
counters_collection = db["counters"]


def check_mongodb_connection():
    client.admin.command("ping")
    print("MongoDB connected successfully!")
