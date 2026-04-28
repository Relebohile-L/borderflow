from flask import Blueprint, request, jsonify
from db import get_db
from config import Config
import json
import uuid

incident_moz_bp = Blueprint("incident_moz", __name__)

# GET all incidents
@incident_moz_bp.route("/incidents", methods=["GET"])
def get_incidents():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM incident")
    incidents = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(incidents), 200

# GET incident by ID
@incident_moz_bp.route("/incidents/<int:incident_id>", methods=["GET"])
def get_incident(incident_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM incident WHERE incident_id = %s", (incident_id,))
    incident = cursor.fetchone()
    cursor.close()
    db.close()
    if not incident:
        return jsonify({"error": "Incident not found"}), 404
    return jsonify(incident), 200

# POST create incident
@incident_moz_bp.route("/incidents", methods=["POST"])
def create_incident():
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO incident
        (trip_id, container_id, reported_by_site_id, incident_type, description, severity, occurred_at, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'open')
    """, (
        data["trip_id"],
        data.get("container_id"),
        data["reported_by_site_id"],
        data.get("incident_type"),
        data.get("description"),
        data.get("severity"),
        data.get("occurred_at")
    ))

    incident_id = cursor.lastrowid

    payload = {
        "incident_id": incident_id,
        "trip_id": data["trip_id"],
        "container_id": data.get("container_id"),
        "reported_by_site_id": data["reported_by_site_id"],
        "incident_type": data.get("incident_type"),
        "description": data.get("description"),
        "severity": data.get("severity"),
        "occurred_at": data.get("occurred_at"),
        "status": "open"
    }

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    """, (
        str(uuid.uuid4()),
        Config.SITE_ID,
        "incident",
        incident_id,
        "INSERT",
        json.dumps(payload),
        None,
        "pending"
    ))

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"incident_id": incident_id, "site": "MOZ", "status": "created"}), 201

# PUT update incident
@incident_moz_bp.route("/incidents/<int:incident_id>", methods=["PUT"])
def update_incident(incident_id):
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT 1 FROM incident WHERE incident_id = %s", (incident_id,))
    if not cursor.fetchone():
        return jsonify({"error": "Incident not found"}), 404

    cursor.execute("""
        UPDATE incident
        SET incident_type = %s,
            description = %s,
            severity = %s,
            occurred_at = %s,
            resolved_at = %s,
            status = %s
        WHERE incident_id = %s
    """, (
        data.get("incident_type"),
        data.get("description"),
        data.get("severity"),
        data.get("occurred_at"),
        data.get("resolved_at"),
        data.get("status"),
        incident_id
    ))

    payload = {
        "incident_id": incident_id,
        "incident_type": data.get("incident_type"),
        "description": data.get("description"),
        "severity": data.get("severity"),
        "occurred_at": data.get("occurred_at"),
        "resolved_at": data.get("resolved_at"),
        "status": data.get("status")
    }

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    """, (
        str(uuid.uuid4()),
        Config.SITE_ID,
        "incident",
        incident_id,
        "UPDATE",
        json.dumps(payload),
        None,
        "pending"
    ))

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"incident_id": incident_id, "status": "updated"}), 200

# DELETE incident
@incident_moz_bp.route("/incidents/<int:incident_id>", methods=["DELETE"])
def delete_incident(incident_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT 1 FROM incident WHERE incident_id = %s", (incident_id,))
    if not cursor.fetchone():
        return jsonify({"error": "Incident not found"}), 404

    cursor.execute("DELETE FROM incident WHERE incident_id = %s", (incident_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"incident_id": incident_id, "status": "deleted"}), 200