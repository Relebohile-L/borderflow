from flask import Blueprint, request, jsonify
from db import get_db
from config import Config
import json
import uuid

handover_moz_bp = Blueprint("handover_moz", __name__)

# GET all handovers
@handover_moz_bp.route("/handovers", methods=["GET"])
def get_handovers():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM handover")
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows), 200


# GET by ID
@handover_moz_bp.route("/handovers/<int:handover_id>", methods=["GET"])
def get_handover(handover_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM handover WHERE handover_id = %s", (handover_id,))
    row = cursor.fetchone()
    cursor.close()
    db.close()
    if not row:
        return jsonify({"error": "Handover not found"}), 404
    return jsonify(row), 200


# POST
@handover_moz_bp.route("/handovers", methods=["POST"])
def create_handover():
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO handover
        (trip_id, container_id, from_site_id, to_site_id,
         released_by_staff_id, received_by_staff_id,
         seal_status, handover_time, latitude, longitude, notes)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        data["trip_id"],
        data["container_id"],
        data["from_site_id"],
        data["to_site_id"],
        data.get("released_by_staff_id"),
        data.get("received_by_staff_id"),
        data.get("seal_status"),
        data.get("handover_time"),
        data.get("latitude"),
        data.get("longitude"),
        data.get("notes")
    ))

    handover_id = cursor.lastrowid

    payload = {
        "handover_id": handover_id,
        "trip_id": data["trip_id"],
        "container_id": data["container_id"],
        "from_site_id": data["from_site_id"],
        "to_site_id": data["to_site_id"],
        "released_by_staff_id": data.get("released_by_staff_id"),
        "received_by_staff_id": data.get("received_by_staff_id"),
        "seal_status": data.get("seal_status"),
        "handover_time": data.get("handover_time"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "notes": data.get("notes")
    }

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    """, (
        str(uuid.uuid4()),
        Config.SITE_ID,
        "handover",
        handover_id,
        "INSERT",
        json.dumps(payload),
        None,
        "pending"
    ))

    db.commit()
    cursor.close()
    db.close()
    return jsonify({
        "handover_id": handover_id,
        "site": "MOZ",
        "status": "created"
    }), 201


# PUT
@handover_moz_bp.route("/handovers/<int:handover_id>", methods=["PUT"])
def update_handover(handover_id):
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT 1 FROM handover WHERE handover_id = %s", (handover_id,))
    if not cursor.fetchone():
        return jsonify({"error": "Not found"}), 404

    cursor.execute("""
        UPDATE handover
        SET seal_status=%s,
            handover_time=%s,
            latitude=%s,
            longitude=%s,
            notes=%s
        WHERE handover_id=%s
    """, (
        data.get("seal_status"),
        data.get("handover_time"),
        data.get("latitude"),
        data.get("longitude"),
        data.get("notes"),
        handover_id
    ))

    payload = {
        "handover_id": handover_id,
        "seal_status": data.get("seal_status"),
        "handover_time": data.get("handover_time"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "notes": data.get("notes")
    }

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    """, (
        str(uuid.uuid4()),
        Config.SITE_ID,
        "handover",
        handover_id,
        "UPDATE",
        json.dumps(payload),
        None,
        "pending"
    ))

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"handover_id": handover_id, "status": "updated"}), 200


# DELETE
@handover_moz_bp.route("/handovers/<int:handover_id>", methods=["DELETE"])
def delete_handover(handover_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("DELETE FROM handover WHERE handover_id = %s", (handover_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"handover_id": handover_id, "status": "deleted"}), 200