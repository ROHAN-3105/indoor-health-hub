import sqlite3
import random
from datetime import datetime, timedelta

DB_NAME = "monacos.db"
DEVICE_ID = "monacos_room_01"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def generate_data():
    conn = get_db()
    cursor = conn.cursor()

    # Clear existing data for this device to avoid duplicates/mess
    print(f"Clearing old data for {DEVICE_ID}...")
    cursor.execute("DELETE FROM sensor_readings WHERE device_id = ?", (DEVICE_ID,))
    
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=7)
    
    current_time = start_time
    count = 0

    print(f"Generating 7 days of data starting from {start_time.isoformat()}...")

    while current_time <= end_time:
        # Base values
        hour = current_time.hour
        
        # Temperature Pattern: Rise in afternoon (12 PM - 4 PM)
        temp_base = 24.0
        if 12 <= hour <= 16:
            temp_base += random.uniform(2.0, 5.0)
        
        temperature = round(max(22.0, min(30.0, temp_base + random.uniform(-1.0, 1.0))), 1)

        # Humidity Range: 40-65%
        humidity = round(random.uniform(40.0, 65.0), 1)

        # PM2.5 & Noise Pattern: Spike around 8 PM (20:00)
        pm25_base = 15.0
        pm10_base = 20.0
        noise_base = 35.0
        
        if 19 <= hour <= 21: # 7 PM to 9 PM window for "cooking/activity"
            pm25_base += random.uniform(10.0, 15.0)
            pm10_base += random.uniform(15.0, 20.0)
            noise_base += random.uniform(15.0, 20.0)
        
        pm25 = round(max(10.0, min(35.0, pm25_base + random.uniform(-2.0, 2.0))), 1)
        pm10 = round(max(15.0, min(45.0, pm10_base + random.uniform(-3.0, 3.0))), 1)
        noise = round(max(30.0, min(60.0, noise_base + random.uniform(-5.0, 5.0))), 1)
        
        # Light: Day/Night cycle
        # 6 AM to 6 PM is "Day"
        if 6 <= hour <= 18:
            light = round(random.uniform(300.0, 500.0), 1)
        else:
            light = round(random.uniform(200.0, 250.0), 1) # Dimmer at night, but per requirements 200-500

        # Additional features
        co2_base = 400.0
        vocs_base = 10.0
        if 8 <= hour <= 22: # higher during active hours
            co2_base += random.uniform(100.0, 300.0)
            vocs_base += random.uniform(5.0, 20.0)
        
        if 19 <= hour <= 21: # cooking spike
            co2_base += random.uniform(200.0, 400.0)
            vocs_base += random.uniform(50.0, 100.0)

        co2 = round(max(400.0, min(1500.0, co2_base + random.uniform(-20.0, 20.0))), 1)
        vocs = round(max(0.0, min(500.0, vocs_base + random.uniform(-5.0, 5.0))), 1)
        
        pressure = round(random.uniform(1010.0, 1015.0), 1)
        altitude = 500.0  # assumed constant for the device location
        
        # Synthetic AQI and Health Score for history points
        aqi = round((pm25 * 2) + random.uniform(-2.0, 5.0), 1) 
        air_quality_score = max(0, 100 - (aqi / 2))

        cursor.execute("""
            INSERT INTO sensor_readings (
                device_id, temperature, humidity, pm25, pm10, noise, light,
                altitude, pressure, co2, vocs, aqi, air_quality_score, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (DEVICE_ID, temperature, humidity, pm25, pm10, noise, light, 
              altitude, pressure, co2, vocs, aqi, air_quality_score, current_time))

        current_time += timedelta(hours=2)
        count += 1

    conn.commit()
    conn.close()
    print(f"✅ Successfully inserted {count} records for {DEVICE_ID}")

if __name__ == "__main__":
    generate_data()
