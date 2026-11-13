# backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS

from database import check_mongodb_connection

from routes.auth_routes import auth_bp
from routes.citizen_routes import citizen_bp
from routes.admin_routes import admin_bp
from routes.authority_routes import authority_bp
from routes.sysadmin_routes import sysadmin_bp


app = Flask(__name__)

# Full CORS configuration for React frontend
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(citizen_bp, url_prefix="/api/citizen")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(authority_bp, url_prefix="/api/authority")
app.register_blueprint(sysadmin_bp, url_prefix="/api/sysadmin")


@app.route("/")
def home():
    return jsonify({
        "success": True,
        "status": "success",
        "message": "CIVIC CONNECT AI Civic Governance Backend is running",
        "version": "2.0.0"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "success": True,
        "status": "healthy",
        "service": "civic-connect-backend"
    })


@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "success": False,
        "status": "error",
        "message": "Requested endpoint not found"
    }), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({
        "success": False,
        "status": "error",
        "message": "An internal server error occurred"
    }), 500


if __name__ == "__main__":
    check_mongodb_connection()
    app.run(debug=True, host="127.0.0.1", port=5000)
