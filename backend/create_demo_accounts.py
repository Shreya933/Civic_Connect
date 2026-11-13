# backend/create_demo_accounts.py

from datetime import datetime, timezone, timedelta
from bson import ObjectId

from database import (
    users_collection,
    departments_collection,
    complaints_collection,
    assignments_collection,
    db
)
from utils.security import hash_password

PRIMARY_DEMO_ACCOUNTS = [
    {
        "full_name": "Demo Citizen",
        "email": "citizen@civic.test",
        "password": "Citizen@123",
        "role": "CITIZEN",
        "mobile": "9876543210",
        "designation": "Citizen Resident",
        "department": None,
        "employee_id": None,
        "account_status": "ACTIVE"
    },
    {
        "full_name": "Demo Municipal Admin",
        "email": "admin@civic.test",
        "password": "Admin@123",
        "role": "MUNICIPAL_ADMIN",
        "mobile": "9876543211",
        "designation": "Executive Ward Administrator",
        "department": "Municipal Administration",
        "employee_id": "ADM-2026-001",
        "account_status": "ACTIVE"
    },
    {
        "full_name": "Demo Higher Authority",
        "email": "authority@civic.test",
        "password": "Authority@123",
        "role": "HIGHER_AUTHORITY",
        "mobile": "9876543212",
        "designation": "Municipal Commissioner / Chief Inspector",
        "department": "Urban Governance Oversight",
        "employee_id": "AUTH-2026-009",
        "account_status": "ACTIVE"
    },
    {
        "full_name": "Demo System Admin",
        "email": "sysadmin@civic.test",
        "password": "SysAdmin@123",
        "role": "SYSTEM_ADMIN",
        "mobile": "9876543213",
        "designation": "Principal System Architect & Administrator",
        "department": "Information Technology Directorate",
        "employee_id": "SYS-2026-100",
        "account_status": "ACTIVE"
    },
    # Secondary alias accounts for convenience
    {
        "full_name": "Rajesh Kumar (Citizen)",
        "email": "citizen@demo.com",
        "password": "Citizen@123",
        "role": "CITIZEN",
        "mobile": "9876543210",
        "designation": "Citizen Resident",
        "department": None,
        "employee_id": None,
        "account_status": "ACTIVE"
    },
    {
        "full_name": "Suresh Patil (Municipal Admin)",
        "email": "admin@demo.com",
        "password": "Admin@123",
        "role": "MUNICIPAL_ADMIN",
        "mobile": "9876543211",
        "designation": "Executive Ward Administrator",
        "department": "Municipal Administration",
        "employee_id": "ADM-2026-002",
        "account_status": "ACTIVE"
    },
    {
        "full_name": "Dr. Anita Sharma (Higher Authority)",
        "email": "authority@demo.com",
        "password": "Authority@123",
        "role": "HIGHER_AUTHORITY",
        "mobile": "9876543212",
        "designation": "Municipal Commissioner",
        "department": "Urban Governance Oversight",
        "employee_id": "AUTH-2026-010",
        "account_status": "ACTIVE"
    },
    {
        "full_name": "Vikram Malhotra (System Admin)",
        "email": "sysadmin@demo.com",
        "password": "SysAdmin@123",
        "role": "SYSTEM_ADMIN",
        "mobile": "9876543213",
        "designation": "Principal System Architect",
        "department": "Information Technology Directorate",
        "employee_id": "SYS-2026-101",
        "account_status": "ACTIVE"
    }
]

DEFAULT_DEPARTMENTS = [
    {
        "name": "Roads & Traffic Infrastructure",
        "description": "Potholes, road surface damages, pedestrian walkways, and traffic barricades.",
        "is_active": True
    },
    {
        "name": "Solid Waste & Sanitation",
        "description": "Garbage overflow, street sweeping, illegal dumping, and public bins.",
        "is_active": True
    },
    {
        "name": "Water Supply & Drainage",
        "description": "Pipeline leakages, open manholes, contaminated drinking water, and flooding.",
        "is_active": True
    },
    {
        "name": "Street Lighting & Electrical",
        "description": "Damaged poles, faulty streetlights, hanging live wires, and transformer sparks.",
        "is_active": True
    },
    {
        "name": "Public Health & Environment",
        "description": "Stagnant water breeding, mosquito control, public park hygiene, and stray hazards.",
        "is_active": True
    }
]


def seed_database():
    now = datetime.now(timezone.utc)
    print("==================================================")
    print("CIVIC CONNECT — DEMO ACCOUNTS & SEED DATA SETUP")
    print("==================================================")

    # 1. Seed City if not present
    city = db.cities.find_one()
    if not city:
        city_doc = {
            "name": "Metropolitan Smart City",
            "state": "Maharashtra",
            "district": "Central Division",
            "created_at": now,
            "updated_at": now
        }
        res = db.cities.insert_one(city_doc)
        city_id = res.inserted_id
        print(f"[+] Created City: Metropolitan Smart City ({city_id})")
    else:
        city_id = city["_id"]
        print(f"[*] Existing City found: {city.get('name')} ({city_id})")

    # 2. Seed Departments if not present
    created_depts = []
    for dept_data in DEFAULT_DEPARTMENTS:
        existing = departments_collection.find_one({"name": dept_data["name"]})
        if not existing:
            doc = {
                "name": dept_data["name"],
                "description": dept_data["description"],
                "city_id": city_id,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            }
            res = departments_collection.insert_one(doc)
            doc["_id"] = res.inserted_id
            created_depts.append(doc)
            print(f"[+] Created Department: {dept_data['name']}")
        else:
            created_depts.append(existing)

    # 3. Seed / Update Demo Users
    print("\n---------------- DEMO ACCOUNTS ----------------")
    for acc in PRIMARY_DEMO_ACCOUNTS:
        email = acc["email"].lower()
        existing = users_collection.find_one({"email": email})

        user_doc = {
            "full_name": acc["full_name"],
            "email": email,
            "mobile": acc["mobile"],
            "password_hash": hash_password(acc["password"]),
            "role": acc["role"],
            "requested_role": None,
            "account_status": "ACTIVE",
            "email_verified": True,
            "employee_id": acc["employee_id"],
            "designation": acc["designation"],
            "department": acc["department"],
            "jurisdiction": {
                "city_id": city_id,
                "district": "Central Division",
                "state": "Maharashtra"
            },
            "two_factor_required": (acc["role"] != "CITIZEN"),
            "approved_by": None,
            "approved_at": now,
            "rejection_reason": None,
            "failed_login_count": 0,
            "locked_until": None,
            "last_login_at": None,
            "created_at": now,
            "updated_at": now
        }

        if existing:
            users_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "password_hash": hash_password(acc["password"]),
                    "role": acc["role"],
                    "account_status": "ACTIVE",
                    "full_name": acc["full_name"],
                    "jurisdiction": {
                        "city_id": city_id,
                        "district": "Central Division",
                        "state": "Maharashtra"
                    },
                    "updated_at": now
                }}
            )
            print(f"[*] Updated account: {email} -> Role: {acc['role']} (Active)")
        else:
            users_collection.insert_one(user_doc)
            print(f"[+] Created demo account: {email} -> Role: {acc['role']} (Active)")

    # 4. Also create 1 pending staff account for System Admin approval demo
    pending_staff_email = "engineer.patel@civic.test"
    if not users_collection.find_one({"email": pending_staff_email}):
        pending_doc = {
            "full_name": "Rohan Patel (Junior Engineer)",
            "email": pending_staff_email,
            "mobile": "9876500001",
            "password_hash": hash_password("Staff@123"),
            "role": "MUNICIPAL_ADMIN",
            "requested_role": "MUNICIPAL_ADMIN",
            "account_status": "PENDING_APPROVAL",
            "email_verified": True,
            "employee_id": "ENG-2026-088",
            "designation": "Assistant Roads Engineer",
            "department": "Roads & Traffic Infrastructure",
            "jurisdiction": {"city_id": city_id},
            "two_factor_required": True,
            "created_at": now,
            "updated_at": now
        }
        users_collection.insert_one(pending_doc)
        print(f"[+] Created Pending Staff account for SysAdmin review: {pending_staff_email}")

    # 5. Ensure Demo Complaints & Assignments exist for rich demonstration
    citizen_user = users_collection.find_one({"email": "citizen@civic.test"}) or users_collection.find_one({"email": "citizen@demo.com"})
    admin_user = users_collection.find_one({"email": "admin@civic.test"}) or users_collection.find_one({"email": "admin@demo.com"})

    if complaints_collection.count_documents({}) == 0 and citizen_user:
        print("\n[*] Seeding initial civic complaints for realistic dashboard demonstration...")
        c1 = {
            "complaint_id": "CC-2026-00101",
            "citizen_id": citizen_user["_id"],
            "source": "CITIZEN_WEB",
            "prediction": {
                "category": "Road damage and potholes",
                "state": "Severe crater in asphalt",
                "confidence": 0.94
            },
            "image": {
                "url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
                "thumbnail_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=200&auto=format&fit=crop&q=80"
            },
            "location": {"latitude": 18.5204, "longitude": 73.8567},
            "address": "Mahatma Gandhi Road near Central Market, Ward 4",
            "city_id": city_id,
            "city": "Metropolitan Smart City",
            "status": "PENDING_REVIEW",
            "description": "Deep pothole causing serious vehicle damage and traffic backup during rush hours.",
            "title": "Severe road pothole near market entrance",
            "submitted_at": now - timedelta(hours=6),
            "created_at": now - timedelta(hours=6),
            "updated_at": now - timedelta(hours=6)
        }

        c2 = {
            "complaint_id": "CC-2026-00102",
            "citizen_id": citizen_user["_id"],
            "source": "CITIZEN_WEB",
            "prediction": {
                "category": "Garbage accumulation",
                "state": "Overflowing public container",
                "confidence": 0.92
            },
            "image": {
                "url": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80",
                "thumbnail_url": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=200&auto=format&fit=crop&q=80"
            },
            "location": {"latitude": 18.5280, "longitude": 73.8650},
            "address": "Sector 9 Commercial Boulevard, Ward 12",
            "city_id": city_id,
            "city": "Metropolitan Smart City",
            "status": "IN_PROGRESS",
            "description": "Municipal dustbin has been overflowing for three days with foul odor.",
            "title": "Uncollected garbage overflow on 9th Boulevard",
            "submitted_at": now - timedelta(days=2),
            "created_at": now - timedelta(days=2),
            "updated_at": now - timedelta(days=1)
        }

        c3 = {
            "complaint_id": "CC-2026-00103",
            "citizen_id": citizen_user["_id"],
            "source": "CITIZEN_WEB",
            "prediction": {
                "category": "Broken streetlights",
                "state": "Dark zone electrical hazard",
                "confidence": 0.89
            },
            "image": {
                "url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
                "thumbnail_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80"
            },
            "location": {"latitude": 18.5350, "longitude": 73.8420},
            "address": "Greenfield Avenue, Street 14, Ward 7",
            "city_id": city_id,
            "city": "Metropolitan Smart City",
            "status": "RESOLVED",
            "description": "Three consecutive streetlights down for a week causing safety concerns.",
            "title": "Broken streetlights on residential stretch",
            "submitted_at": now - timedelta(days=4),
            "completed_at": now - timedelta(hours=12),
            "created_at": now - timedelta(days=4),
            "updated_at": now - timedelta(hours=12)
        }

        res1 = complaints_collection.insert_one(c1)
        res2 = complaints_collection.insert_one(c2)
        res3 = complaints_collection.insert_one(c3)

        dept_waste = created_depts[1] if len(created_depts) > 1 else created_depts[0]
        dept_light = created_depts[3] if len(created_depts) > 3 else created_depts[0]

        # In-Progress Assignment for c2
        assignments_collection.insert_one({
            "report_id": "REP-2026-042",
            "complaint_id": res2.inserted_id,
            "department_id": dept_waste["_id"],
            "worker_count": 4,
            "assigned_at": now - timedelta(days=1),
            "assigned_by": admin_user["_id"] if admin_user else citizen_user["_id"],
            "deadline_at": now + timedelta(hours=24),
            "status": "IN_PROGRESS",
            "is_active": True,
            "was_overdue": False,
            "first_overdue_at": None,
            "completed_at": None,
            "completion_image": None,
            "completion_note": None,
            "created_at": now - timedelta(days=1),
            "updated_at": now - timedelta(days=1)
        })

        # Resolved Assignment for c3
        assignments_collection.insert_one({
            "report_id": "REP-2026-039",
            "complaint_id": res3.inserted_id,
            "department_id": dept_light["_id"],
            "worker_count": 2,
            "assigned_at": now - timedelta(days=3),
            "assigned_by": admin_user["_id"] if admin_user else citizen_user["_id"],
            "deadline_at": now - timedelta(days=1),
            "status": "RESOLVED",
            "is_active": False,
            "was_overdue": False,
            "completed_at": now - timedelta(hours=12),
            "completion_image": {
                "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
                "thumbnail_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80"
            },
            "completion_note": "Replaced two fused LED fixtures and repaired junction box.",
            "deadline_met": True,
            "created_at": now - timedelta(days=3),
            "updated_at": now - timedelta(hours=12)
        })
        print("[+] Seeded 3 demonstration complaints & 2 assignments.")

    print("\n==================================================")
    print("DEMO CREDENTIALS SUMMARY:")
    print("--------------------------------------------------")
    for acc in PRIMARY_DEMO_ACCOUNTS[:4]:
        print(f"Role:      {acc['role']}")
        print(f"Name:      {acc['full_name']}")
        print(f"Email:     {acc['email']}")
        print(f"Password:  {acc['password']}")
        print(f"Status:    ACTIVE")
        if acc['role'] != 'CITIZEN':
            print("2FA OTP:   Printed in Flask terminal / Dev mode OTP: 123456")
        print("--------------------------------------------------")
    print("Setup completed successfully!")


if __name__ == "__main__":
    seed_database()
