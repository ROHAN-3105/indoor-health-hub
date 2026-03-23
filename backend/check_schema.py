import sqlite3

try:
    conn = sqlite3.connect('monacos.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(sensor_readings)")
    columns = cursor.fetchall()
    print("Columns in sensor_readings:")
    for col in columns:
        print(col)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
