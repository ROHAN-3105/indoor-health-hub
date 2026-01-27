from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api", tags=["Monacos"])

# TEMP in-memory store (later replaced by DB)
LATEST_DATA = {}

@router.get("/latest/{device_id}")
def get_latest(device_id: str):
    if device_id not in LATEST_DATA:
        raise HTTPException(status_code=404, detail="No data for device")
    return LATEST_DATA[device_id]


@router.get("/health-score/{device_id}")
def get_health_score(device_id: str):
    if device_id not in LATEST_DATA:
        raise HTTPException(status_code=404, detail="No data for device")

    data = LATEST_DATA[device_id]

    score = 100
    reasons = []

    if data["co2"] > 1000:
        score -= 20
        reasons.append("Elevated CO₂ levels detected")

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

    if score >= 80:
        level = "Good"
    elif score >= 60:
        level = "Moderate"
    elif score >= 40:
        level = "Poor"
    else:
        level = "Hazardous"

    return {
        "score": score,
        "level": level,
        "reasons": reasons
    }


@router.get("/alerts/{device_id}")
def get_alerts(device_id: str):
    if device_id not in LATEST_DATA:
        return []

    data = LATEST_DATA[device_id]
    alerts = []

    def add_alert(param, message, severity):
        alerts.append({
            "id": f"{param}-{datetime.utcnow().timestamp()}",
            "parameter": param,
            "message": message,
            "type": severity,
            "timestamp": datetime.utcnow().isoformat(),
            "acknowledged": False
        })

    if data["co2"] > 1000:
        add_alert("CO2", "CO₂ levels are high", "moderate")

    if data["pm25"] > 35:
        add_alert("PM2.5", "PM2.5 concentration is unhealthy", "poor")

    if data["noise"] > 80:
        add_alert("Noise", "Noise levels are hazardous", "hazardous")

    return alerts
