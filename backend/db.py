import sqlite3
from datetime import datetime

DB_NAME = "monacos.db"


def get_db():
    """
    Returns a SQLite connection
    """
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Creates all required tables if they don't exist
    """
    db = get_db()
    cursor = db.cursor()

    # -----------------------------
    # Devices table
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS devices (
        device_id TEXT PRIMARY KEY,
        last_seen DATETIME,
        location TEXT
    )
    """)

    # -----------------------------
    # Sensor readings table
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT,
        temperature REAL,
        humidity REAL,
        pm25 REAL,
        pm10 REAL,
        noise REAL,
        light REAL,
        timestamp DATETIME
    )
    """)

    # -----------------------------
    # Alerts table
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        device_id TEXT,
        severity TEXT,
        title TEXT,
        message TEXT,
        sensor TEXT,
        timestamp DATETIME
    )
    """)

    db.commit()
    db.close()


def ensure_device_exists(device_id: str):
    """
    Inserts device if not already present
    """
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT device_id FROM devices WHERE device_id = ?",
        (device_id,)
    )

    if cursor.fetchone() is None:
        cursor.execute("""
            INSERT INTO devices (device_id, last_seen)
            VALUES (?, ?)
        """, (device_id, datetime.utcnow()))

    else:
        cursor.execute("""
            UPDATE devices
            SET last_seen = ?
            WHERE device_id = ?
        """, (datetime.utcnow(), device_id))

    db.commit()
    db.close()


# -------------------------------------------------
# Manual test (run: python db.py)
# -------------------------------------------------
if __name__ == "__main__":
    init_db()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print("✅ Tables in DB:")
    for table in tables:
        print("-", table["name"])

    conn.close()
