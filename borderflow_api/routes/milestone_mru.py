from flask import Blueprint, request, jsonify
from db import get_db
from config import Config
import json
import uuid

milestone_mru_bp = Blueprint("milestone_mru", __name__)

@milestone_mru_bp.route("/milestones", methods=["GET"])
def get_milestones():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM milestone")
    milestones = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(milestones), 200

@milestone_mru_bp.route("/milestones/<int:milestone_id>", methods=["GET"])
def get_milestone(milestone_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM milestone WHERE milestone_id = %s", (milestone_id,))
    milestone = cursor.fetchone()
    cursor.close()
    db.close()
    if not milestone:
        return jsonify({"error": "Milestone not found"}), 404
    return jsonify(milestone), 200

@milestone_mru_bp.route("/milestones", methods=["POST"])
def create_milestone():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        INSERT INTO milestone
        (trip_id, container_id, site_id, milestone_type, occurred_at, recorded_by_staff_id, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        data["trip_id"],
        data["container_id"],
        data["site_id"],
        data["milestone_type"],
        data.get("occurred_at"),
        data.get("recorded_by_staff_id"),
        data.get("notes")
    ))
    milestone_id = cursor.lastrowid

    payload = {
        "milestone_id": milestone_id,
        "trip_id": data["trip_id"],
        "container_id": data["container_id"],
        "site_id": data["site_id"],
        "milestone_type": data["milestone_type"],
        "occurred_at": data.get("occurred_at"),
        "recorded_by_staff_id": data.get("recorded_by_staff_id"),
        "notes": data.get("notes")
    }

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    """, (
        str(uuid.uuid4()),
        Config.SITE_ID,
        "milestone",
        milestone_id,
        "INSERT",
        json.dumps(payload),
        None,
        "pending"
    ))

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"milestone_id": milestone_id, "site": "MRU", "status": "created"}), 201

@milestone_mru_bp.route("/milestones/<int:milestone_id>", methods=["PUT"])
def update_milestone(milestone_id):
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT 1 FROM milestone WHERE milestone_id = %s", (milestone_id,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        return jsonify({"error": "Milestone not found"}), 404

    cursor.execute("""
        UPDATE milestone
        SET milestone_type = %s,
            occurred_at = %s,
            recorded_by_staff_id = %s,
            notes = %s
        WHERE milestone_id = %s
    """, (
        data.get("milestone_type"),
        data.get("occurred_at"),
        data.get("recorded_by_staff_id"),
        data.get("notes"),
        milestone_id
    ))

    payload = {
        "milestone_id": milestone_id,
        "milestone_type": data.get("milestone_type"),
        "occurred_at": data.get("occurred_at"),
        "recorded_by_staff_id": data.get("recorded_by_staff_id"),
        "notes": data.get("notes")
    }

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    """, (
        str(uuid.uuid4()),
        Config.SITE_ID,
        "milestone",
        milestone_id,
        "UPDATE",
        json.dumps(payload),
        None,
        "pending"
    ))

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"milestone_id": milestone_id, "status": "updated"}), 200

@milestone_mru_bp.route("/milestones/<int:milestone_id>", methods=["DELETE"])
def delete_milestone(milestone_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT 1 FROM milestone WHERE milestone_id = %s", (milestone_id,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        return jsonify({"error": "Milestone not found"}), 404
    cursor.execute("DELETE FROM milestone WHERE milestone_id = %s", (milestone_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"milestone_id": milestone_id, "status": "deleted"}), 200