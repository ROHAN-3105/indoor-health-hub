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
        altitude REAL,
        pressure REAL,
        co2 REAL,
        vocs REAL,
        aqi REAL,
        air_quality_score REAL,
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

    # -----------------------------
    # Users table
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME
    )
    """)

    db.commit()
    
    # Schema Migration (Manual for now)
    # Attempt to add columns if they don't exist
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
    except sqlite3.OperationalError:
        pass # already exists

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
    except sqlite3.OperationalError:
        pass

    # Migration for new sensor fields
    new_cols = ["altitude", "pressure", "co2", "vocs", "aqi", "air_quality_score"]
    for col in new_cols:
        try:
            cursor.execute(f"ALTER TABLE sensor_readings ADD COLUMN {col} REAL")
        except sqlite3.OperationalError:
            pass

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


def create_user(username: str, password_hash: str):
    """
    Creates a new user
    """
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
                      (username, password_hash, datetime.utcnow()))
        db.commit()
        user_id = cursor.lastrowid
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        db.close()


def get_user_by_username(username: str):
    """
    Fetch user by username
    """
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    db.close()
    return user


def update_user_profile(username: str, email: str, full_name: str):
    """
    Update user profile details
    """
    db = get_db()
    cursor = db.cursor()
    # Handle None values by converting to empty string or keeping None
    # SQLite handles None as NULL
    cursor.execute("""
        UPDATE users
        SET email = ?, full_name = ?
        WHERE username = ?
    """, (email, full_name, username))
    db.commit()
    db.close()


def get_all_devices():
    """
    Returns list of all registered devices
    """
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM devices")
    devices = cursor.fetchall()
    db.close()
    return [dict(d) for d in devices]


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
