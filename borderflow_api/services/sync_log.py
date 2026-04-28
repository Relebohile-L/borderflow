# services/sync_log.py
from db import get_db
from config import Config
from datetime import datetime

def write_sync_log(entity_type, entity_id, operation):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        INSERT INTO sync_log
        (site_id, entity_type, entity_id, operation, local_time, sync_status)
        VALUES (%s, %s, %s, %s, %s, 'pending')
    """, (
        Config.SITE_ID,
        entity_type,
        entity_id,
        operation,
        datetime.utcnow()
    ))

    db.commit()
    cursor.close()
    db.close()