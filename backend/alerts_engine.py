from datetime import datetime, timedelta
import uuid

# ----------------------------------
# Alert deduplication cache
# ----------------------------------
ALERT_CACHE = {}
ALERT_COOLDOWN = timedelta(seconds=60)  # 1 alert per type per minute


def _can_emit(device_id: str, alert_type: str) -> bool:
    """
    Prevent alert spam by enforcing cooldown per device + alert type
    """
    now = datetime.utcnow()
    last_time = ALERT_CACHE.get((device_id, alert_type))

    if last_time and (now - last_time) < ALERT_COOLDOWN:
        return False

    ALERT_CACHE[(device_id, alert_type)] = now
    return True


def _new_alert_id(alert_type: str) -> str:
    """
    Generate globally unique alert ID (frontend-safe)
    """
    return f"{alert_type}-{uuid.uuid4().hex}"


def generate_alerts(data: dict):
    alerts = []
    now = datetime.utcnow().isoformat()
    device_id = data.get("device_id", "unknown")

    # -----------------------------
    # PM2.5 (PMS5003)
    # -----------------------------
    pm25 = data.get("pm25", 0)

    if pm25 > 55:
        alert_type = "PM25_HIGH"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "High",
                "title": "High PM2.5 Pollution",
                "message": "Fine particulate matter is very high. Use an air purifier and reduce exposure.",
                "sensor": "PMS5003",
                "timestamp": now
            })

    elif pm25 > 35:
        alert_type = "PM25_MEDIUM"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "Medium",
                "title": "Elevated PM2.5 Levels",
                "message": "PM2.5 levels are above recommended limits. Improve ventilation.",
                "sensor": "PMS5003",
                "timestamp": now
            })

    # -----------------------------
    # PM10 (PMS5003)
    # -----------------------------
    pm10 = data.get("pm10", 0)

    if pm10 > 100:
        alert_type = "PM10_HIGH"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "High",
                "title": "High PM10 Levels",
                "message": "Coarse particulate pollution is high. Avoid dust sources indoors.",
                "sensor": "PMS5003",
                "timestamp": now
            })

    elif pm10 > 50:
        alert_type = "PM10_MEDIUM"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "Medium",
                "title": "Elevated PM10 Levels",
                "message": "PM10 levels are elevated. Clean surfaces and improve airflow.",
                "sensor": "PMS5003",
                "timestamp": now
            })

    # -----------------------------
    # Noise (Sound Sensor)
    # -----------------------------
    noise = data.get("noise", 0)

    if noise > 90:
        alert_type = "NOISE_HIGH"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "High",
                "title": "Excessive Noise Exposure",
                "message": "Noise levels are hazardous. Prolonged exposure may cause hearing discomfort.",
                "sensor": "Sound Sensor",
                "timestamp": now
            })

    elif noise > 75:
        alert_type = "NOISE_MEDIUM"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "Medium",
                "title": "Elevated Noise Levels",
                "message": "Noise levels exceed comfort limits. Consider reducing volume or relocating.",
                "sensor": "Sound Sensor",
                "timestamp": now
            })

    # -----------------------------
    # Humidity (BME680)
    # -----------------------------
    humidity = data.get("humidity", 0)

    if humidity > 75:
        alert_type = "HUMIDITY_HIGH"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "Medium",
                "title": "High Humidity Detected",
                "message": "High humidity may increase mold growth risk. Use a dehumidifier.",
                "sensor": "BME680",
                "timestamp": now
            })

    elif humidity < 30:
        alert_type = "HUMIDITY_LOW"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "Low",
                "title": "Low Humidity Detected",
                "message": "Low humidity may cause dryness and discomfort. Consider a humidifier.",
                "sensor": "BME680",
                "timestamp": now
            })

    return alerts
