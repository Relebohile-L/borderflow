from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime
import json

sync_control_bp = Blueprint("sync_control", __name__)

@sync_control_bp.route("/control/sync", methods=["POST"])
def receive_sync():
    data = request.json
    logs = data.get("logs", [])

    db = get_db(database="borderflow_control")
    cursor = db.cursor()

    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

    applied = 0

    for log in logs:
        log_id = log["log_id"]

        cursor.execute("SELECT 1 FROM sync_log WHERE log_id = %s", (log_id,))
        if cursor.fetchone():
            continue

        cursor.execute("""
            INSERT INTO sync_log
            (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            log_id,
            log["site_id"],
            log["entity_type"],
            log["entity_id"],
            log["operation"],
            json.dumps(log.get("payload", {})),
            log["local_time"],
            datetime.utcnow(),
            "synced"
        ))

        p = log.get("payload", {})
        entity = log["entity_type"]
        operation = log["operation"]

        # ─── TRIP ───
        if entity == "trip" and operation == "INSERT" and p:
            cursor.execute("""
                INSERT IGNORE INTO trip
                (trip_id, vehicle_id, driver_id, origin_site_id, destination_site_id, status)
                VALUES (%s,%s,%s,%s,%s,%s)
            """, (
                p["trip_id"], p["vehicle_id"], p["driver_id"],
                p["origin_site_id"], p["destination_site_id"], p["status"]
            ))

        # ─── CLEARANCE ───
        elif entity == "clearance" and operation == "INSERT" and p:
            cursor.execute("""
                INSERT IGNORE INTO clearance
                (clearance_id, trip_id, container_id, border_site_id,
                 reference_number, submitted_at, cleared_at,
                 cleared_by_staff_id, status, notes)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                p["clearance_id"], p["trip_id"], p["container_id"],
                p["border_site_id"], p.get("reference_number"),
                p.get("submitted_at"), p.get("cleared_at"),
                p.get("cleared_by_staff_id"), p.get("status"), p.get("notes")
            ))

        elif entity == "clearance" and operation == "UPDATE" and p:
            cursor.execute("""
                UPDATE clearance
                SET reference_number=%s, submitted_at=%s, cleared_at=%s,
                    cleared_by_staff_id=%s, status=%s, notes=%s
                WHERE clearance_id=%s
            """, (
                p.get("reference_number"), p.get("submitted_at"),
                p.get("cleared_at"), p.get("cleared_by_staff_id"),
                p.get("status"), p.get("notes"), p["clearance_id"]
            ))

        # ─── HANDOVER ───
        elif entity == "handover" and operation == "INSERT" and p:
            cursor.execute("""
                INSERT IGNORE INTO handover
                (handover_id, trip_id, container_id, from_site_id, to_site_id,
                 released_by_staff_id, received_by_staff_id,
                 seal_status, handover_time, latitude, longitude, notes)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                p["handover_id"], p["trip_id"], p["container_id"],
                p["from_site_id"], p["to_site_id"],
                p.get("released_by_staff_id"), p.get("received_by_staff_id"),
                p.get("seal_status"), p.get("handover_time"),
                p.get("latitude"), p.get("longitude"), p.get("notes")
            ))

        elif entity == "handover" and operation == "UPDATE" and p:
            cursor.execute("""
                UPDATE handover
                SET seal_status=%s, handover_time=%s,
                    latitude=%s, longitude=%s, notes=%s
                WHERE handover_id=%s
            """, (
                p.get("seal_status"), p.get("handover_time"),
                p.get("latitude"), p.get("longitude"),
                p.get("notes"), p["handover_id"]
            ))

        # ─── INCIDENT ───
        elif entity == "incident" and operation == "INSERT" and p:
            cursor.execute("""
                INSERT IGNORE INTO incident
                (incident_id, trip_id, container_id, reported_by_site_id,
                 incident_type, description, severity, occurred_at, status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                p["incident_id"], p["trip_id"], p.get("container_id"),
                p["reported_by_site_id"], p.get("incident_type"),
                p.get("description"), p.get("severity"),
                p.get("occurred_at"), p.get("status")
            ))

        elif entity == "incident" and operation == "UPDATE" and p:
            cursor.execute("""
                UPDATE incident
                SET incident_type=%s, description=%s, severity=%s,
                    occurred_at=%s, resolved_at=%s, status=%s
                WHERE incident_id=%s
            """, (
                p.get("incident_type"), p.get("description"),
                p.get("severity"), p.get("occurred_at"),
                p.get("resolved_at"), p.get("status"), p["incident_id"]
            ))

        # ─── MILESTONE ───
        elif entity == "milestone" and operation == "INSERT" and p:
            cursor.execute("""
                INSERT IGNORE INTO milestone
                (milestone_id, trip_id, container_id, site_id,
                 milestone_type, occurred_at, recorded_by_staff_id, notes)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                p["milestone_id"], p["trip_id"], p["container_id"],
                p["site_id"], p["milestone_type"], p.get("occurred_at"),
                p.get("recorded_by_staff_id"), p.get("notes")
            ))

        elif entity == "milestone" and operation == "UPDATE" and p:
            cursor.execute("""
                UPDATE milestone
                SET milestone_type=%s, occurred_at=%s,
                    recorded_by_staff_id=%s, notes=%s
                WHERE milestone_id=%s
            """, (
                p.get("milestone_type"), p.get("occurred_at"),
                p.get("recorded_by_staff_id"), p.get("notes"),
                p["milestone_id"]
            ))

        applied += 1

    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "sync complete", "applied": applied}), 200