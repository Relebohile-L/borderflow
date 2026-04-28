import uuid
from datetime import datetime

def create_sync_log(cursor, site_id, entity_type, entity_id, operation):
    log_id = str(uuid.uuid4())
    local_time = datetime.utcnow()

    cursor.execute("""
        INSERT INTO sync_log
        (log_id, site_id, entity_type, entity_id, operation, local_time, synced_at, sync_status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        log_id,
        site_id,
        entity_type,
        entity_id,
        operation,
        local_time,
        None,        # synced_at = NULL initially
        "pending"
    ))

    return log_id