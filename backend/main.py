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
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# IN-MEMORY STORAGE
# ---------------------------

DEVICE_STATE: Dict[str, dict] = {}
DEVICE_HISTORY: Dict[str, List[dict]] = {}
DEVICE_ALERTS: Dict[str, List[dict]] = {}

MAX_HISTORY = 60          # last 60 readings
ONLINE_TIMEOUT = 30      # seconds

# ---------------------------
# DATA MODEL
# ---------------------------

class SensorPayload(BaseModel):
    device_id: str

    temperature: float
    humidity: float

    pm25: float
    pm10: float

    noise: float
    light: float

    timestamp: datetime | None = None

# ---------------------------
# INGEST SENSOR DATA
# ---------------------------

@app.post("/api/ingest")
def ingest(payload: SensorPayload):
    timestamp = payload.timestamp or datetime.utcnow()

    data = payload.dict()
    data["timestamp"] = timestamp

    # latest snapshot
    DEVICE_STATE[payload.device_id] = data

    # history buffer
    DEVICE_HISTORY.setdefault(payload.device_id, []).append(data)
    DEVICE_HISTORY[payload.device_id] = DEVICE_HISTORY[payload.device_id][-MAX_HISTORY:]

    return {
        "status": "ingested",
        "device_id": payload.device_id,
        "timestamp": timestamp,
    }

# ---------------------------
# GET LATEST DATA
# ---------------------------

@app.get("/api/latest/{device_id}")
def get_latest(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    return DEVICE_STATE[device_id]

# ---------------------------
# HISTORY
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
        raise HTTPException(404, "Device offline")

    return calculate_health_score(DEVICE_STATE[device_id])

# ---------------------------
# ALERTS
# ---------------------------

@app.get("/api/alerts/{device_id}")
def get_alerts(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    new_alerts = generate_alerts(DEVICE_STATE[device_id])

    DEVICE_ALERTS.setdefault(device_id, [])

    existing_ids = {a["id"] for a in DEVICE_ALERTS[device_id]}

    for alert in new_alerts:
        if alert["id"] not in existing_ids:
            DEVICE_ALERTS[device_id].append(alert)

    return DEVICE_ALERTS[device_id]

# ---------------------------
# LIST DEVICES
# ---------------------------

@app.get("/api/devices")
def list_devices():
    now = datetime.utcnow()
    devices = []

    for device_id, data in DEVICE_STATE.items():
        last_seen = data["timestamp"]

        online = (now - last_seen) < timedelta(seconds=ONLINE_TIMEOUT)

        devices.append({
            "device_id": device_id,
            "last_seen": last_seen,
            "status": "online" if online else "offline",
            "temperature": data["temperature"],
            "pm25": data["pm25"],
            "noise": data["noise"],
            "light": data["light"],
        })

    return devices

# ---------------------------
# RECOMMENDATIONS
# ---------------------------

@app.get("/api/recommendations/{device_id}")
def recommendations(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    return generate_recommendations(DEVICE_STATE[device_id])

# ---------------------------
# AQI
# ---------------------------

@app.get("/api/aqi/{device_id}")
def get_aqi(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    data = DEVICE_STATE[device_id]

    return calculate_pm_aqi(data["pm25"], data["pm10"])
