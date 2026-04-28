from flask import Blueprint, jsonify, request
from db import get_db

resources_bp = Blueprint("resources", __name__)


@resources_bp.route("/drivers", methods=["GET"])
def get_drivers():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM driver WHERE status = 'active'")
    rows = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(rows), 200


@resources_bp.route("/vehicles", methods=["GET"])
def get_vehicles():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM vehicle WHERE status = 'available'")
    rows = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(rows), 200


@resources_bp.route("/containers", methods=["GET"])
def get_containers():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM container
        WHERE container_id NOT IN (
            SELECT tc.container_id FROM trip_container tc
            JOIN trip t ON t.trip_id = tc.trip_id
            WHERE t.status IN ('scheduled', 'in_transit')
        )
    """)
    rows = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(rows), 200


@resources_bp.route("/containers/all", methods=["GET"])
def get_all_containers():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM container")
    rows = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(rows), 200


@resources_bp.route("/sites", methods=["GET"])
def get_sites():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM site")
    rows = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(rows), 200


@resources_bp.route("/consignments", methods=["GET"])
def get_consignments():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    client_id = request.args.get("client_id")
    if client_id:
        cursor.execute("""
            SELECT con.*, cl.company_name, cl.contact_name
            FROM consignment con
            JOIN client cl ON con.client_id = cl.client_id
            WHERE con.client_id = %s
            ORDER BY con.created_at DESC
        """, (int(client_id),))
    else:
        cursor.execute("""
            SELECT con.*, cl.company_name, cl.contact_name
            FROM consignment con
            JOIN client cl ON con.client_id = cl.client_id
            ORDER BY con.created_at DESC
        """)
    rows = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(rows), 200


@resources_bp.route("/consignment-containers", methods=["GET"])
def get_consignment_containers():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    consignment_id = request.args.get("consignment_id")
    if consignment_id:
        cursor.execute("""
            SELECT cc.*, c.iso_code, c.container_type, c.status AS container_status, c.seal_number
            FROM consignment_container cc
            JOIN container c ON cc.container_id = c.container_id
            WHERE cc.consignment_id = %s
        """, (int(consignment_id),))
    else:
        cursor.execute("""
            SELECT cc.*, c.iso_code, c.container_type, c.status AS container_status, c.seal_number
            FROM consignment_container cc
            JOIN container c ON cc.container_id = c.container_id
        """)
    rows = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(rows), 200


@resources_bp.route("/audit", methods=["GET"])
def get_audit():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM sync_log ORDER BY local_time DESC LIMIT 500")
    rows = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(rows), 200
