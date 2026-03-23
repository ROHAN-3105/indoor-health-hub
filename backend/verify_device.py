
import sqlite3
import os

DB_PATH = "backend/monacos.db"

def check_device():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM devices WHERE device_id = 'monacos_room_01'")
        device = cursor.fetchone()
        if device:
            print("Device 'monacos_room_01' FOUND in DB.")
        else:
            print("Device 'monacos_room_01' NOT FOUND in DB.")
            
        cursor.execute("SELECT count(*) FROM sensor_readings WHERE device_id = 'monacos_room_01'")
        count = cursor.fetchone()[0]
        print(f"Found {count} sensor readings for this device.")
        
    except Exception as e:
        print(f"Error querying DB: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_device()
