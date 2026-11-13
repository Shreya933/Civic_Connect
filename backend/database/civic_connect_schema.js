/*
 * CIVIC CONNECT - MongoDB schema
 *
 * Conventions:
 * - Timestamps are BSON Dates stored in UTC.
 * - Human-readable IDs are generated server-side using counters.
 * - Assignments reference complaints using ObjectId.
 * - Historical overdue information must never be cleared.
 *
 * This script creates collections or updates their validators.
 * It does not delete collections or documents.
 */

const dbName = "civic_connect";
const d = db.getSiblingDB(dbName);


// ---------------------------------------------------------------- helpers

function make(name, schema) {
    if (d.getCollectionNames().includes(name)) {
        const result = d.runCommand({
            collMod: name,
            validator: {
                $jsonSchema: schema
            },
            validationLevel: "strict",
            validationAction: "error"
        });

        if (result.ok !== 1) {
            throw new Error(
                "Failed to update collection " +
                name +
                ": " +
                JSON.stringify(result)
            );
        }
    } else {
        d.createCollection(name, {
            validator: {
                $jsonSchema: schema
            },
            validationLevel: "strict",
            validationAction: "error"
        });
    }
}


const STR = {
    bsonType: "string"
};

const NSTR = {
    bsonType: ["string", "null"]
};

const OID = {
    bsonType: "objectId"
};

const NOID = {
    bsonType: ["objectId", "null"]
};

const DATE = {
    bsonType: "date"
};

const NDATE = {
    bsonType: ["date", "null"]
};

const IMAGE_REF = {
    bsonType: "object",
    required: [
        "storage_key",
        "content_type",
        "size_bytes"
    ],
    properties: {
        storage_key: STR,
        content_type: STR,
        size_bytes: {
            bsonType: ["int", "long"]
        },
        sha256: STR
    }
};


// ---------------------------------------------------------------- cities

make("cities", {
    bsonType: "object",
    required: [
        "name",
        "state",
        "district",
        "timezone",
        "is_active",
        "created_at",
        "updated_at"
    ],
    properties: {
        name: STR,
        state: STR,
        district: STR,
        timezone: STR,
        is_active: {
            bsonType: "bool"
        },
        created_at: DATE,
        updated_at: DATE
    }
});

d.cities.createIndex(
    {
        state: 1,
        district: 1,
        name: 1
    },
    {
        unique: true
    }
);


// ---------------------------------------------------------------- users

make("users", {
    bsonType: "object",
    required: [
        "full_name",
        "email",
        "mobile",
        "password_hash",
        "role",
        "account_status",
        "email_verified",
        "created_at",
        "updated_at"
    ],
    properties: {
        full_name: STR,
        email: STR,
        mobile: STR,
        password_hash: STR,

        role: {
            enum: [
                "CITIZEN",
                "ADMIN",
                "HIGHER_AUTHORITY",
                "SYSTEM_ADMIN",
                null
            ]
        },

        requested_role: {
            enum: [
                "ADMIN",
                "HIGHER_AUTHORITY",
                null
            ]
        },

        account_status: {
            enum: [
                "ACTIVE",
                "PENDING_APPROVAL",
                "REJECTED",
                "SUSPENDED"
            ]
        },

        employee_id: NSTR,
        designation: NSTR,

        jurisdiction: {
            bsonType: ["object", "null"],
            properties: {
                city_id: NOID,
                district: NSTR,
                state: NSTR
            }
        },

        two_factor_required: {
            bsonType: "bool"
        },

        email_verified: {
            bsonType: "bool"
        },

        approved_by: NOID,
        approved_at: NDATE,
        rejection_reason: NSTR,

        failed_login_count: {
            bsonType: "int"
        },

        locked_until: NDATE,
        last_login_at: NDATE,
        created_at: DATE,
        updated_at: DATE
    }
});

d.users.createIndex(
    { email: 1 },
    { unique: true }
);

d.users.createIndex(
    { employee_id: 1 },
    {
        unique: true,
        partialFilterExpression: {
            employee_id: {
                $type: "string"
            }
        }
    }
);

d.users.createIndex({
    account_status: 1,
    requested_role: 1,
    created_at: -1
});


// ---------------------------------------------------------------- otp_challenges

make("otp_challenges", {
    bsonType: "object",
    required: [
        "user_id",
        "purpose",
        "otp_hash",
        "expires_at",
        "attempts",
        "resend_count",
        "created_at"
    ],
    properties: {
        user_id: OID,

        purpose: {
            enum: [
                "LOGIN",
                "EMAIL_VERIFY"
            ]
        },

        otp_hash: STR,
        expires_at: DATE,

        attempts: {
            bsonType: "int"
        },

        resend_count: {
            bsonType: "int"
        },

        last_sent_at: DATE,
        consumed_at: NDATE,
        created_at: DATE
    }
});

d.otp_challenges.createIndex({
    user_id: 1,
    purpose: 1,
    created_at: -1
});

d.otp_challenges.createIndex(
    { expires_at: 1 },
    { expireAfterSeconds: 3600 }
);


// ---------------------------------------------------------------- refresh_tokens

make("refresh_tokens", {
    bsonType: "object",
    required: [
        "user_id",
        "token_hash",
        "family_id",
        "expires_at",
        "created_at"
    ],
    properties: {
        user_id: OID,
        token_hash: STR,
        family_id: STR,
        expires_at: DATE,
        revoked_at: NDATE,
        created_at: DATE
    }
});

d.refresh_tokens.createIndex(
    { token_hash: 1 },
    { unique: true }
);

d.refresh_tokens.createIndex({
    user_id: 1
});

d.refresh_tokens.createIndex(
    { expires_at: 1 },
    { expireAfterSeconds: 0 }
);


// ---------------------------------------------------------------- departments

make("departments", {
    bsonType: "object",
    required: [
        "name",
        "city_id",
        "is_active",
        "created_at",
        "updated_at"
    ],
    properties: {
        name: STR,
        city_id: OID,

        is_active: {
            bsonType: "bool"
        },

        created_at: DATE,
        updated_at: DATE
    }
});

d.departments.createIndex(
    {
        city_id: 1,
        name: 1
    },
    {
        unique: true
    }
);


// ---------------------------------------------------------------- counters

make("counters", {
    bsonType: "object",
    required: [
        "_id",
        "seq"
    ],
    properties: {
        _id: STR,

        seq: {
            bsonType: ["int", "long"]
        }
    }
});


// ---------------------------------------------------------------- complaints

make("complaints", {
    bsonType: "object",
    required: [
        "complaint_id",
        "citizen_id",
        "source",
        "image",
        "prediction",
        "location",
        "city_id",
        "issue_date",
        "submitted_at",
        "status",
        "created_at",
        "updated_at"
    ],
    properties: {
        complaint_id: STR,
        citizen_id: OID,

        source: {
            enum: [
                "CAPTURE",
                "UPLOAD"
            ]
        },

        image: IMAGE_REF,

        prediction: {
            bsonType: "object",
            required: [
                "state",
                "category"
            ],
            properties: {
                state: {
                    enum: [
                        "CLASSIFIED",
                        "LOW_CONFIDENCE",
                        "FAILED"
                    ]
                },

                category: STR,

                confidence: {
                    bsonType: ["double", "null"]
                },

                model_version: NSTR,

                top_k: {
                    bsonType: ["array", "null"]
                }
            }
        },

        category_override: {
            bsonType: ["object", "null"],
            properties: {
                category: STR,
                by: OID,
                at: DATE,
                reason: NSTR
            }
        },

        location: {
            bsonType: "object",
            required: [
                "type",
                "coordinates"
            ],
            properties: {
                type: {
                    enum: ["Point"]
                },

                coordinates: {
                    bsonType: "array",
                    minItems: 2,
                    maxItems: 2,
                    items: {
                        bsonType: "double"
                    }
                },

                accuracy_m: {
                    bsonType: ["double", "null"]
                }
            }
        },

        address: {
            bsonType: ["object", "null"],
            properties: {
                formatted: STR,
                locality: NSTR,
                city: NSTR,
                district: NSTR,
                state: NSTR,
                pincode: NSTR
            }
        },

        city_id: OID,
        issue_date: DATE,
        submitted_at: DATE,

        status: {
            enum: [
                "PENDING_REVIEW",
                "IN_PROGRESS",
                "OVERDUE",
                "RESOLVED",
                "REJECTED"
            ]
        },

        rejection: {
            bsonType: ["object", "null"],
            properties: {
                reason: STR,
                rejected_by: OID,
                rejected_at: DATE
            }
        },

        current_assignment_id: NOID,
        completed_at: NDATE,
        created_at: DATE,
        updated_at: DATE
    }
});

d.complaints.createIndex(
    { complaint_id: 1 },
    { unique: true }
);

d.complaints.createIndex({
    citizen_id: 1,
    submitted_at: -1
});

d.complaints.createIndex({
    city_id: 1,
    status: 1,
    submitted_at: -1
});

d.complaints.createIndex({
    location: "2dsphere"
});

d.complaints.createIndex({
    city_id: 1,
    "prediction.category": 1
});


// ---------------------------------------------------------------- assignments

make("assignments", {
    bsonType: "object",
    required: [
        "report_id",
        "complaint_id",
        "department_id",
        "worker_count",
        "assigned_at",
        "assigned_by",
        "deadline_at",
        "status",
        "is_active",
        "was_overdue",
        "created_at",
        "updated_at"
    ],
    properties: {
        report_id: STR,
        complaint_id: OID,
        department_id: OID,

        worker_count: {
            bsonType: "int",
            minimum: 1
        },

        assigned_at: DATE,
        assigned_by: OID,
        deadline_at: DATE,

        status: {
            enum: [
                "IN_PROGRESS",
                "OVERDUE",
                "RESOLVED"
            ]
        },

        is_active: {
            bsonType: "bool"
        },

        was_overdue: {
            bsonType: "bool"
        },

        first_overdue_at: NDATE,
        completed_at: NDATE,
        completed_by: NOID,

        completion_image: {
            bsonType: ["object", "null"],
            properties: IMAGE_REF.properties
        },

        created_at: DATE,
        updated_at: DATE
    }
});

d.assignments.createIndex(
    { report_id: 1 },
    { unique: true }
);

d.assignments.createIndex(
    { complaint_id: 1 },
    {
        unique: true,
        partialFilterExpression: {
            is_active: true
        }
    }
);

d.assignments.createIndex({
    complaint_id: 1,
    created_at: -1
});

d.assignments.createIndex({
    status: 1,
    deadline_at: 1
});

d.assignments.createIndex({
    department_id: 1,
    status: 1
});

d.assignments.createIndex({
    was_overdue: 1,
    department_id: 1
});


// ---------------------------------------------------------------- status_history

make("status_history", {
    bsonType: "object",
    required: [
        "entity_type",
        "entity_id",
        "to_status",
        "at",
        "actor"
    ],
    properties: {
        entity_type: {
            enum: [
                "COMPLAINT",
                "ASSIGNMENT"
            ]
        },

        entity_id: OID,
        from_status: NSTR,
        to_status: STR,
        at: DATE,

        actor: {
            bsonType: "object",
            required: ["type"],
            properties: {
                type: {
                    enum: [
                        "USER",
                        "SYSTEM"
                    ]
                },

                user_id: NOID
            }
        },

        reason: NSTR,

        details: {
            bsonType: ["object", "null"]
        }
    }
});

d.status_history.createIndex({
    entity_type: 1,
    entity_id: 1,
    at: 1
});

d.status_history.createIndex({
    to_status: 1,
    at: -1
});


// ---------------------------------------------------------------- admin_actions

make("admin_actions", {
    bsonType: "object",
    required: [
        "authority_id",
        "action_type",
        "reason",
        "action_date",
        "status",
        "created_at",
        "updated_at"
    ],
    properties: {
        authority_id: OID,

        department_id: NOID,

        // Optional links for future services.
        complaint_id: NOID,
        assignment_id: NOID,
        target_user_id: NOID,

        // Field names used by the existing AdminActionModel.
        related_complaint_id: NOID,
        related_assignment_id: NOID,

        action_type: {
            enum: [
                "COMPLAINT_APPROVED",
                "COMPLAINT_REJECTED",
                "ASSIGNMENT_CREATED",
                "ASSIGNMENT_RESOLVED",
                "EXPLANATION_REQUESTED",
                "WARNING_ISSUED",
                "CORRECTIVE_MEASURE_REQUIRED",
                "PERFORMANCE_REVIEW_INITIATED",
                "PENALTY_INITIATED",
                "OTHER"
            ]
        },

        reason: STR,
        legal_reference: NSTR,

        metrics_snapshot: {
            bsonType: ["object", "null"]
        },

        action_date: DATE,

        outcome: NSTR,
        outcome_updated_at: NDATE,

        status: {
            enum: [
                "OPEN",
                "CLOSED"
            ]
        },

        created_at: DATE,
        updated_at: DATE
    }
});

d.admin_actions.createIndex({
    department_id: 1,
    action_date: -1
});

d.admin_actions.createIndex({
    authority_id: 1,
    action_date: -1
});

d.admin_actions.createIndex({
    complaint_id: 1,
    action_date: -1
});

d.admin_actions.createIndex({
    assignment_id: 1,
    action_date: -1
});

d.admin_actions.createIndex({
    related_complaint_id: 1
});

d.admin_actions.createIndex({
    related_assignment_id: 1
});

d.admin_actions.createIndex({
    action_type: 1,
    action_date: -1
});


// ---------------------------------------------------------------- audit_logs

make("audit_logs", {
    bsonType: "object",
    required: [
        "event",
        "at"
    ],
    properties: {
        event: STR,
        user_id: NOID,
        ip: NSTR,
        user_agent: NSTR,

        target: {
            bsonType: ["object", "null"]
        },

        at: DATE
    }
});

d.audit_logs.createIndex({
    user_id: 1,
    at: -1
});

d.audit_logs.createIndex({
    event: 1,
    at: -1
});


print("CIVIC CONNECT schema applied to " + dbName);