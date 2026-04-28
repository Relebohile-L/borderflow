import os

class Config:
    DB_USER = "root"
    DB_PASS = "root"
    DB_PORT = 3306

    SITE = os.getenv("SITE", "sa").lower()

    SITE_MAP = {
        "sa": {
            "DB_HOST": "sa-db-service",
            "DB_NAME": "borderflow_sa",
            "SITE_ID": 1
        },
        "moz": {
            "DB_HOST": "moz-db-service",
            "DB_NAME": "borderflow_moz",
            "SITE_ID": 2
        },
        "mru": {
            "DB_HOST": "mru-db-service",
            "DB_NAME": "borderflow_mru",
            "SITE_ID": 3
        },
        "control":
            {"DB_HOST": "control-db-service", 
             "DB_NAME": "borderflow_control", 
             "SITE_ID": 0}
    }

    if SITE not in SITE_MAP:
        raise ValueError(f"Invalid SITE: {SITE}. Must be sa | moz | mru")

    # Allow local dev overrides via env vars
    DB_HOST = os.getenv("DB_HOST", SITE_MAP[SITE]["DB_HOST"])
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_NAME = SITE_MAP[SITE]["DB_NAME"]
    SITE_ID = SITE_MAP[SITE]["SITE_ID"]