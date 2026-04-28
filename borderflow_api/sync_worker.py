import os
import json
import requests
import mysql.connector
from datetime import datetime

# ─────────────────────────────────────────
# CONFIG (driven by environment variables)
# ─────────────────────────────────────────
SITE         = os.getenv("SITE", "sa").lower()
CONTROL_URL  = os.getenv("CONTROL_URL", "http://control-api/control/sync")
DB_HOST      = os.getenv("DB_HOST")
DB_NAME      = os.getenv("DB_NAME")
DB_USER      = os.getenv("DB_USER", "root")
DB_PASS      = os.getenv("DB_PASS", "root")
DB_PORT      = int(os.getenv("DB_PORT", 3306))

# ─────────────────────────────────────────
# CONNECT TO LOCAL SITE DB
# ─────────────────────────────────────────
def get_db():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT,
        database=DB_NAME
    )

# ─────────────────────────────────────────
# MAIN SYNC LOGIC
# ─────────────────────────────────────────
def run_sync():
    print(f"[{datetime.utcnow()}] Starting sync for site: {SITE.upper()}")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # 1. Read all pending rows that have a payload
    cursor.execute("""
        SELECT log_id, site_id, entity_type, entity_id, operation, payload, local_time
        FROM sync_log
        WHERE sync_status = 'pending'
        AND payload IS NOT NULL
        ORDER BY local_time ASC
    """)
    rows = cursor.fetchall()

    if not rows:
        print(f"[{datetime.utcnow()}] No pending rows found. Exiting.")
        cursor.close()
        db.close()
        return

    print(f"[{datetime.utcnow()}] Found {len(rows)} pending rows. Sending to control...")

    # 2. Build the payload for the control API
    logs = []
    for row in rows:
        logs.append({
            "log_id":      row["log_id"],
            "site_id":     row["site_id"],
            "entity_type": row["entity_type"],
            "entity_id":   row["entity_id"],
            "operation":   row["operation"],
            "payload":     json.loads(row["payload"]) if row["payload"] else {},
            "local_time":  row["local_time"].isoformat()
        })

    # 3. POST to control API
    try:
        response = requests.post(
            CONTROL_URL,
            json={"logs": logs},
            timeout=10
        )
        response.raise_for_status()
        result = response.json()
        print(f"[{datetime.utcnow()}] Control API response: {result}")

    except Exception as e:
        print(f"[{datetime.utcnow()}] ERROR: Failed to reach control API: {e}")
        cursor.close()
        db.close()
        return

    # 4. Mark rows as synced
    log_ids = [row["log_id"] for row in rows]
    format_strings = ",".join(["%s"] * len(log_ids))
    cursor.execute(f"""
        UPDATE sync_log
        SET sync_status = 'success', synced_at = NOW()
        WHERE log_id IN ({format_strings})
    """, log_ids)

    db.commit()
    print(f"[{datetime.utcnow()}] Marked {len(log_ids)} rows as synced.")

    cursor.close()
    db.close()

if __name__ == "__main__":
    run_sync()