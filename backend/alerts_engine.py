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

    # -----------------------------
    # Temperature (DHT11/BME680)
    # -----------------------------
    temp = data.get("temperature", 22)

    if temp > 30:
        alert_type = "TEMP_HIGH"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "High",
                "title": "High Temperature",
                "message": "Room temperature is excessively high (>30°C). Improve cooling.",
                "sensor": "Temperature Sensor",
                "timestamp": now
            })
    elif temp < 16:
        alert_type = "TEMP_LOW"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "Medium",
                "title": "Low Temperature",
                "message": "Room is too cold (<16°C). Check heating.",
                "sensor": "Temperature Sensor",
                "timestamp": now
            })

    # -----------------------------
    # Sensor Interference / Diagnostics
    # -----------------------------
    
    # 1. Light > 10,000 lux
    light = data.get("light", 0)
    if light > 10000:
        alert_type = "INTERFERENCE_LIGHT"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "High",
                "title": "Sensor Interference Alert",
                "message": "Light > 10,000 lux. Check if a flashlight is pointing directly at the sensor or if it’s in direct midday sunlight.",
                "sensor": "Light Sensor",
                "timestamp": now
            })

    # 2. Temp > 45°C (and smoke/VOCs low)
    # Assuming 'gas' or 'vocs' represents smoke/vocs. 
    # The SensorPayload has 'vocs', 'gas'. Let's check 'vocs' first, then 'gas'.
    # If not present, we might skip the secondary check or assume low.
    # User said: "Temp > 45°C (and smoke/VOCs are low)"
    # Let's define "low" as... maybe < 100 (arbitrary, but standard is usually higher for smoke) 
    # or just if Temp is high.
    # Looking at data model: 'vocs' is optional.
    vocs = data.get("vocs", 0)
    if temp > 45 and vocs < 200: # Assuming < 200 index is "low/normal" for many sensors
        alert_type = "INTERFERENCE_HEAT"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "High",
                "title": "Sensor Interference Alert",
                "message": "Temp > 45°C with low VOCs. Check if device is on a heat-emitting appliance (laptop exhaust, router).",
                "sensor": "Temperature Sensor",
                "timestamp": now
            })

    # 3. Humidity > 95%
    if humidity > 95:
        alert_type = "INTERFERENCE_HUMIDITY"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "High",
                "title": "Sensor Interference Alert",
                "message": "Humidity > 95%. Check if near a humidifier or if someone breathed on the sensor.",
                "sensor": "Humidity Sensor",
                "timestamp": now
            })

    # 4. CO2 < 400 ppm
    co2 = data.get("co2", 450) # Default to 450 (normal) if missing so we don't trigger alert on missing data
    if co2 < 400 and co2 > 0: # > 0 to ensure it's a real reading
        alert_type = "INTERFERENCE_CO2"
        if _can_emit(device_id, alert_type):
            alerts.append({
                "id": _new_alert_id(alert_type),
                "severity": "Medium",
                "title": "Sensor Interference Alert",
                "message": "CO2 < 400 ppm. The sensor may need calibration (outdoor baseline is ~400ppm).",
                "sensor": "CO2 Sensor",
                "timestamp": now
            })

    return alerts
