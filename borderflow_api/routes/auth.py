from flask import Blueprint, request, jsonify
from db import get_db
from config import Config
import bcrypt

auth_bp = Blueprint("auth", __name__)

VALID_STAFF_ROLES = [
    "driver",
    "dispatcher",
    "depot_clerk",
    "depot_manager",
    "yard_clerk",
    "port_agent",
    "border_agent",
    "manager",
    "customer",
]


def get_database_and_site(username_lower):
    if username_lower.startswith("sa_"):
        return "borderflow_sa", "SA"
    elif username_lower.startswith("moz_"):
        return "borderflow_moz", "MOZ"
    elif username_lower.startswith("mru_"):
        return "borderflow_mru", "MRU"
    elif username_lower.startswith("control_"):
        return "borderflow_control", "CONTROL"
    return None, None


@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    # Guard: Content-Type must be application/json; request.json is None otherwise
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")
    role     = data.get("role", "").strip()

    if not username or not password or not role:
        return jsonify({"error": "Username, password and role required"}), 400

    username_lower = username.lower()
    database, site = get_database_and_site(username_lower)

    if not database:
        return jsonify({"error": "Invalid username prefix. Use sa_, moz_, mru_, or control_"}), 400

    # Each pod only serves its own site — reject cross-site logins cleanly
    if database != Config.DB_NAME:
        return jsonify({"error": f"This portal serves {Config.SITE.upper()} accounts only. Use the {site} portal for {site} credentials."}), 403

    # Control tower only allows managers
    if site == "CONTROL" and role != "manager":
        return jsonify({"error": "Only managers can access the control tower"}), 403

    db     = get_db()
    cursor = db.cursor(dictionary=True)

    # ── CLIENT LOGIN ──────────────────────────────────────────────────────────
    if role == "client":
        cursor.execute(
            """
            SELECT client_id, company_name, contact_name, email, username, password
            FROM client
            WHERE username = %s
            """,
            (username,),
        )
        user = cursor.fetchone()
        cursor.close()
        db.close()

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        stored_password = user.get("password") or ""
        if not stored_password:
            return jsonify({"error": "Invalid credentials"}), 401

        if stored_password.startswith(("$2b$", "$2a$")):
            if not bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8")):
                return jsonify({"error": "Invalid credentials"}), 401
        else:
            if password != stored_password:
                return jsonify({"error": "Invalid credentials"}), 401

        user.pop("password", None)
        return jsonify({
            "message": "Login successful",
            "site":    site,
            "role":    "client",
            "user":    user,
        }), 200

    # ── STAFF LOGIN ───────────────────────────────────────────────────────────
    if role not in VALID_STAFF_ROLES:
        return jsonify({
            "error": f"Invalid role. Valid roles: {', '.join(VALID_STAFF_ROLES)}"
        }), 400

    cursor.execute(
        """
        SELECT staff_id, site_id, first_name, last_name, role, email, username, password
        FROM staff
        WHERE username = %s AND role = %s
        """,
        (username, role),
    )
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user:
        return jsonify({"error": "Invalid credentials or role mismatch"}), 401

    stored_password = user.get("password") or ""
    if not stored_password:
        return jsonify({"error": "Invalid credentials"}), 401

    if stored_password.startswith(("$2b$", "$2a$")):
        if not bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8")):
            return jsonify({"error": "Invalid credentials"}), 401
    else:
        if password != stored_password:
            return jsonify({"error": "Invalid credentials"}), 401

    user.pop("password", None)
    return jsonify({
        "message": "Login successful",
        "site":    site,
        "role":    role,
        "user":    user,
    }), 200