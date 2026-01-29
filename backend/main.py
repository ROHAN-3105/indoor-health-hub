from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Dict, List
from recommendation_engine import generate_recommendations
from aqi_engine import calculate_pm_aqi

from alerts_engine import generate_alerts
from health_engine import calculate_health_score

# ---------------------------
# APP SETUP
# ---------------------------

app = FastAPI(title="Monacos Indoor Health API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# IN-MEMORY STORAGE
# ---------------------------

DEVICE_STATE: Dict[str, dict] = {}
DEVICE_HISTORY: Dict[str, List[dict]] = {}

MAX_HISTORY = 60          # last 60 readings per device
ONLINE_TIMEOUT = 30      # seconds to consider device online

# ---------------------------
# DATA MODEL
# ---------------------------

class SensorPayload(BaseModel):
    device_id: str

    # BME680
    temperature: float
    humidity: float

    # PMS5003
    pm25: float
    pm10: float

    # MQ135
    air_quality: float

    # Sound sensor
    noise: float

    # BH1750
    light: float

    timestamp: datetime | None = None

# ---------------------------
# INGEST SENSOR DATA
# ---------------------------

@app.post("/api/ingest")
def ingest(payload: SensorPayload):
    data = payload.dict()
    data["timestamp"] = payload.timestamp or datetime.utcnow()

    # latest snapshot
    DEVICE_STATE[payload.device_id] = data

    # history buffer
    if payload.device_id not in DEVICE_HISTORY:
        DEVICE_HISTORY[payload.device_id] = []

    DEVICE_HISTORY[payload.device_id].append(data)

    # rolling window
    DEVICE_HISTORY[payload.device_id] = DEVICE_HISTORY[payload.device_id][-MAX_HISTORY:]

    return {
        "status": "ingested",
        "device_id": payload.device_id,
        "timestamp": data["timestamp"],
    }

# ---------------------------
# GET LATEST DATA
# ---------------------------

@app.get("/api/latest/{device_id}")
def get_latest(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(status_code=404, detail="Device offline")

    return DEVICE_STATE[device_id]

# ---------------------------
# HISTORY (ANALYTICS)
# ---------------------------

@app.get("/api/history/{device_id}")
def get_history(device_id: str):
    return DEVICE_HISTORY.get(device_id, [])

# ---------------------------
# HEALTH SCORE
# ---------------------------

@app.get("/api/health-score/{device_id}")
def get_health_score(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(status_code=404, detail="Device offline")

    return calculate_health_score(DEVICE_STATE[device_id])

# ---------------------------
# ALERTS
# ---------------------------

@app.get("/api/alerts/{device_id}")
def get_alerts(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(status_code=404, detail="Device offline")

    return generate_alerts(DEVICE_STATE[device_id])

# ---------------------------
# LIST DEVICES (DEVICES PAGE)
# ---------------------------

@app.get("/api/devices")
def list_devices():
    now = datetime.utcnow()
    devices = []

    for device_id, data in DEVICE_STATE.items():
        last_seen = data.get("timestamp")

        online = (
            last_seen is not None
            and (now - last_seen) < timedelta(seconds=ONLINE_TIMEOUT)
        )

        devices.append({
            "device_id": device_id,
            "last_seen": last_seen,
            "status": "online" if online else "offline",

            # live snapshot for cards
            "temperature": data.get("temperature"),
            "pm25": data.get("pm25"),
            "noise": data.get("noise"),
            "light": data.get("light"),
        })

    return devices

@app.get("/api/recommendations/{device_id}")
def recommendations(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    return generate_recommendations(DEVICE_STATE[device_id])

#AQI 
@app.get("/api/aqi/{device_id}")
def get_aqi(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(status_code=404, detail="Device offline")

    data = DEVICE_STATE[device_id]

    pm25 = data.get("pm25")
    pm10 = data.get("pm10")

    if pm25 is None or pm10 is None:
        raise HTTPException(status_code=400, detail="PM data not available")

    return calculate_pm_aqi(pm25, pm10)
