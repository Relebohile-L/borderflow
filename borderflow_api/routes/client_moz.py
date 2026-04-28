from flask import Blueprint, request, jsonify
from db import get_db

client_moz_bp = Blueprint("client_moz", __name__)

# GET all clients
@client_moz_bp.route("/clients", methods=["GET"])
def get_clients():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM client")
    clients = cursor.fetchall()

    cursor.close()
    db.close()
    return jsonify(clients), 200


# GET client by ID
@client_moz_bp.route("/clients/<int:client_id>", methods=["GET"])
def get_client(client_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM client WHERE client_id = %s", (client_id,))
    client = cursor.fetchone()

    cursor.close()
    db.close()

    if not client:
        return jsonify({"error": "Client not found"}), 404

    return jsonify(client), 200


# POST create client
@client_moz_bp.route("/clients", methods=["POST"])
def create_client():
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # prevent duplicate email
    if data.get("email"):
        cursor.execute("SELECT 1 FROM client WHERE email = %s", (data["email"],))
        if cursor.fetchone():
            return jsonify({"error": "Email already exists"}), 400

    cursor.execute("""
        INSERT INTO client (company_name, contact_name, email, phone)
        VALUES (%s, %s, %s, %s)
    """, (
        data["company_name"],
        data.get("contact_name"),
        data.get("email"),
        data.get("phone")
    ))

    client_id = cursor.lastrowid
    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "client_id": client_id,
        "site": "MOZ",
        "status": "created"
    }), 201


# PUT update client
@client_moz_bp.route("/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT 1 FROM client WHERE client_id = %s", (client_id,))
    if not cursor.fetchone():
        return jsonify({"error": "Client not found"}), 404

    cursor.execute("""
        UPDATE client
        SET company_name = %s,
            contact_name = %s,
            email = %s,
            phone = %s
        WHERE client_id = %s
    """, (
        data.get("company_name"),
        data.get("contact_name"),
        data.get("email"),
        data.get("phone"),
        client_id
    ))

    db.commit()
    cursor.close()
    db.close()

    return jsonify({"client_id": client_id, "status": "updated"}), 200


# DELETE client
@client_moz_bp.route("/clients/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT 1 FROM client WHERE client_id = %s", (client_id,))
    if not cursor.fetchone():
        return jsonify({"error": "Client not found"}), 404

    cursor.execute("DELETE FROM client WHERE client_id = %s", (client_id,))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"client_id": client_id, "status": "deleted"}), 200