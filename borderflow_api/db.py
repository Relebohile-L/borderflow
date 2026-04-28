import mysql.connector
from mysql.connector import Error
from config import Config

def get_db(database=None):
    try:
        return mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASS,
            port=Config.DB_PORT,
            database=database or Config.DB_NAME
        )
    except Error as e:
        print(f"[DB CONNECTION ERROR] {e}")
        raise