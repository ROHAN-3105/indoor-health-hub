
import sqlite3
import os
from datetime import datetime, timedelta

# Mocking the path logic from agent_engine/db
DB_NAME = "backend/monacos.db" 

if not os.path.exists(DB_NAME):
    # Try just monacos.db if running from backend dir
    if os.path.exists("monacos.db"):
        DB_NAME = "monacos.db"

print(f"Checking DB: {DB_NAME}")

conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()

# 1. Check total count
cursor.execute("SELECT count(*) FROM sensor_readings WHERE device_id='monacos_room_01'")
count = cursor.fetchone()[0]
print(f"Total records for 'monacos_room_01': {count}")

# 2. Check latest timestamp
cursor.execute("SELECT timestamp FROM sensor_readings WHERE device_id='monacos_room_01' ORDER BY timestamp DESC LIMIT 1")
latest = cursor.fetchone()
print(f"Latest timestamp in DB: {latest[0] if latest else 'None'}")

if latest:
    # Check if inside 24h window
    # SQLite stores strings usually, need to parse
    ts_str = latest[0]
    try:
        ts = datetime.fromisoformat(ts_str) if 'T' in ts_str else datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S.%f")
    except:
        ts = datetime.fromisoformat(ts_str) # attempt default
        
    now = datetime.utcnow()
    diff = now - ts
    print(f"Current UTC: {now}")
    print(f"Time since latest record: {diff}")
    
    if diff > timedelta(hours=24):
        print("⚠️ LATEST DATA IS OLDER THAN 24 HOURS. This explains why the bot sees nothing.")
    else:
        print("✅ Data is strictly within 24h. The bot SHOULD see it.")

conn.close()
