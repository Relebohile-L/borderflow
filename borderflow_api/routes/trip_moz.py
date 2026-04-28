from flask import Blueprint, request, jsonify
from config import Config
from db import get_db
import uuid
import json

trip_moz_bp = Blueprint("trip_moz", __name__)

@trip_moz_bp.route("/trips", methods=["GET"])
def get_trips_moz():
    db = get_db(database="borderflow_moz")
    cursor = db.cursor(dictionary=True)
    driver_id = request.args.get("driver_id")
    if driver_id:
        cursor.execute("SELECT * FROM trip WHERE driver_id = %s", (int(driver_id),))
    else:
        cursor.execute("SELECT * FROM trip")
    trips = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(trips), 200

@trip_moz_bp.route("/trip", methods=["POST"])
def create_trip_moz():
    data = request.json

    db = get_db(database="borderflow_moz")
    cursor = db.cursor()

    vehicle_id = data["vehicle_id"]
    driver_id = data["driver_id"]
    origin_site_id = data["origin_site_id"]
    destination_site_id = data["destination_site_id"]
    containers = data["containers"]

    cursor.execute("""
        SELECT 1 FROM trip
        WHERE vehicle_id = %s
        AND status IN ('scheduled','in_transit')
    """, (vehicle_id,))
    if cursor.fetchone():
        return jsonify({"error": "Vehicle already in active trip"}), 400

    cursor.execute("""
        SELECT 1 FROM trip
        WHERE driver_id = %s
        AND status IN ('scheduled','in_transit')
    """, (driver_id,))
    if cursor.fetchone():
        return jsonify({"error": "Driver already in active trip"}), 400

    for c in containers:
        cursor.execute("""
            SELECT 1
            FROM trip t
            JOIN trip_container tc ON t.trip_id = tc.trip_id
            WHERE tc.container_id = %s
            AND t.status IN ('scheduled','in_transit')
        """, (c,))
        if cursor.fetchone():
            return jsonify({"error": f"Container {c} already in active trip"}), 400

    cursor.execute("""
        INSERT INTO trip (vehicle_id, driver_id, origin_site_id, destination_site_id, status)
        VALUES (%s,%s,%s,%s,'scheduled')
    """, (vehicle_id, driver_id, origin_site_id, destination_site_id))

    trip_id = cursor.lastrowid
    print(f"[DEBUG] trip inserted, trip_id={trip_id}")

    for c in containers:
        cursor.execute("""
            INSERT INTO trip_container (trip_id, container_id, assigned_at)
            VALUES (%s,%s,NOW())
        """, (trip_id, c))

    # -----------------------------
    # SYNC LOG (MINIMAL FIX)
    # -----------------------------
    payload = {
        "trip_id": trip_id,
        "vehicle_id": vehicle_id,
        "driver_id": driver_id,
        "origin_site_id": origin_site_id,
        "destination_site_id": destination_site_id,
        "containers": containers,
        "status": "scheduled"
    }

    log_id = str(uuid.uuid4())
    print(f"[DEBUG] attempting sync_log insert, log_id={log_id}, site_id={Config.SITE_ID}")

    try:
        cursor.execute("""
            INSERT INTO sync_log
            (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
        """, (
            log_id,
            Config.SITE_ID,
            "trip",
            trip_id,
            "INSERT",
            json.dumps(payload),   # ✅ FIXED
            None,
            "pending"
        ))
        print(f"[DEBUG] sync_log rows affected: {cursor.rowcount}")
    except Exception as e:
        print(f"[DEBUG] sync_log INSERT failed: {e}")

    db.commit()
    print("[DEBUG] committed")
    cursor.close()
    db.close()

    return jsonify({
        "trip_id": trip_id,
        "site": "MOZ",
        "status": "created"
    }), 201