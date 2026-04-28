from flask import Blueprint, request, jsonify
from db import get_db
from config import Config
import json
import uuid

clearance_moz_bp = Blueprint("clearance_moz", __name__)

@clearance_moz_bp.route("/clearances", methods=["GET"])
def get_clearances():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM clearance")
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows), 200


@clearance_moz_bp.route("/clearances/<int:clearance_id>", methods=["GET"])
def get_clearance(clearance_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM clearance WHERE clearance_id = %s", (clearance_id,))
    row = cursor.fetchone()
    cursor.close()
    db.close()
    if not row:
        return jsonify({"error": "Clearance not found"}), 404
    return jsonify(row), 200


@clearance_moz_bp.route("/clearances", methods=["POST"])
def create_clearance():
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO clearance
        (trip_id, container_id, border_site_id,
         reference_number, submitted_at, cleared_at,
         cleared_by_staff_id, status, notes)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        data["trip_id"],
        data["container_id"],
        data["border_site_id"],
        data.get("reference_number"),
        data.get("submitted_at"),
        data.get("cleared_at"),
        data.get("cleared_by_staff_id"),
        data.get("status", "pending"),
        data.get("notes")
    ))

    clearance_id = cursor.lastrowid

    payload = {
        "clearance_id": clearance_id,
        "trip_id": data["trip_id"],
        "container_id": data["container_id"],
        "border_site_id": data["border_site_id"],
        "reference_number": data.get("reference_number"),
        "submitted_at": data.get("submitted_at"),
        "cleared_at": data.get("cleared_at"),
        "cleared_by_staff_id": data.get("cleared_by_staff_id"),
        "status": data.get("status", "pending"),
        "notes": data.get("notes")
    }

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    """, (
        str(uuid.uuid4()),
        Config.SITE_ID,
        "clearance",
        clearance_id,
        "INSERT",
        json.dumps(payload),
        None,
        "pending"
    ))

    db.commit()
    cursor.close()
    db.close()
    return jsonify({
        "clearance_id": clearance_id,
        "site": "MOZ",
        "status": "created"
    }), 201


@clearance_moz_bp.route("/clearances/<int:clearance_id>", methods=["PUT"])
def update_clearance(clearance_id):
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT 1 FROM clearance WHERE clearance_id = %s", (clearance_id,))
    if not cursor.fetchone():
        return jsonify({"error": "Not found"}), 404

    cursor.execute("""
        UPDATE clearance
        SET reference_number=%s,
            submitted_at=%s,
            cleared_at=%s,
            cleared_by_staff_id=%s,
            status=%s,
            notes=%s
        WHERE clearance_id=%s
    """, (
        data.get("reference_number"),
        data.get("submitted_at"),
        data.get("cleared_at"),
        data.get("cleared_by_staff_id"),
        data.get("status"),
        data.get("notes"),
        clearance_id
    ))

    payload = {
        "clearance_id": clearance_id,
        "reference_number": data.get("reference_number"),
        "submitted_at": data.get("submitted_at"),
        "cleared_at": data.get("cleared_at"),
        "cleared_by_staff_id": data.get("cleared_by_staff_id"),
        "status": data.get("status"),
        "notes": data.get("notes")
    }

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    """, (
        str(uuid.uuid4()),
        Config.SITE_ID,
        "clearance",
        clearance_id,
        "UPDATE",
        json.dumps(payload),
        None,
        "pending"
    ))

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"clearance_id": clearance_id, "status": "updated"}), 200


@clearance_moz_bp.route("/clearances/<int:clearance_id>", methods=["DELETE"])
def delete_clearance(clearance_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("DELETE FROM clearance WHERE clearance_id = %s", (clearance_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"clearance_id": clearance_id, "status": "deleted"}), 200