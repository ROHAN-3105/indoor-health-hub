from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from schemas import SensorData
from db import get_db, ensure_device_exists

router = APIRouter(prefix="/api", tags=["Monacos"])

# In-memory cache for latest device data
LATEST_DATA = {}

# -------------------------------------------------
# GET latest data (frontend dashboard)
# -------------------------------------------------
@router.get("/latest/{device_id}")
def get_latest(device_id: str):
    if device_id not in LATEST_DATA:
        raise HTTPException(status_code=404, detail="No data for device")
    return LATEST_DATA[device_id]


# -------------------------------------------------
# HEALTH SCORE
# -------------------------------------------------
@router.get("/health-score/{device_id}")
def get_health_score(device_id: str):
    if device_id not in LATEST_DATA:
        raise HTTPException(status_code=404, detail="No data for device")

    data = LATEST_DATA[device_id]

    score = 100
    reasons = []

    if data["pm25"] > 35:
        score -= 20
        reasons.append("High PM2.5 concentration")

    if data["pm10"] > 50:
        score -= 20
        reasons.append("Elevated PM10 levels")

    if data["noise"] > 70:
        score -= 20
        reasons.append("Noise exposure exceeds comfort limits")

    if data["humidity"] > 65:
        score -= 10
        reasons.append("High humidity may increase mold risk")

    score = max(score, 0)

    level = (
        "Good" if score >= 80 else
        "Moderate" if score >= 60 else
        "Poor" if score >= 40 else
        "Hazardous"
    )

    return {
        "score": score,
        "level": level,
        "reasons": reasons
    }


# -------------------------------------------------
# ALERTS
# -------------------------------------------------
@router.get("/alerts/{device_id}")
def get_alerts(device_id: str):
    if device_id not in LATEST_DATA:
        return []

    data = LATEST_DATA[device_id]
    alerts = []

    def add_alert(parameter, message, severity):
        alerts.append({
            "id": f"{parameter}-{datetime.utcnow().timestamp()}",
            "parameter": parameter,
            "message": message,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat()
        })

    if data["pm25"] > 35:
        add_alert("PM2.5", "PM2.5 levels are unhealthy", "warning")

    if data["pm10"] > 50:
        add_alert("PM10", "PM10 levels are elevated", "warning")

    if data["noise"] > 80:
        add_alert("Noise", "Noise levels are hazardous", "critical")

    return alerts


# -------------------------------------------------
# HISTORICAL DATA
# -------------------------------------------------
@router.get("/history/{device_id}")
def get_history(device_id: str):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get data from last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    cursor.execute("""
        SELECT * FROM sensor_readings
        WHERE device_id = ? AND timestamp >= ?
        ORDER BY timestamp ASC
    """, (device_id, seven_days_ago))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


# -------------------------------------------------
# INGEST SENSOR DATA (ESP32 → Backend)
# -------------------------------------------------
@router.post("/ingest")
def ingest_data(data: SensorData):
    device_id = data.device_id
    ensure_device_exists(device_id)

    timestamp = datetime.utcnow()

    # ✅ Update in-memory cache (frontend uses this)
    LATEST_DATA[device_id] = {
        **data.dict(exclude={"timestamp"}),
        "timestamp": timestamp.isoformat()
    }

    # ✅ Persist to SQLite
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO sensor_readings (
            device_id,
            temperature,
            humidity,
            pm25,
            pm10,
            noise,
            light,
            timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        device_id,
        data.temperature,
        data.humidity,
        data.pm25,
        data.pm10,
        data.noise,
        data.light,
        timestamp
    ))

    conn.commit()
    conn.close()

    return {
        "status": "ok",
        "device_id": device_id,
        "timestamp": timestamp
    }
