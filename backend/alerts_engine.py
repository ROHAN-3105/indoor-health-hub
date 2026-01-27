from datetime import datetime

def generate_alerts(data: dict):
    alerts = []
    now = datetime.utcnow().isoformat()

    # Air Quality (MQ135)
    if data["air_quality"] > 1200:
        alerts.append({
            "severity": "High",
            "title": "Poor Air Quality",
            "message": "Air quality levels are very high. Improve ventilation immediately.",
            "sensor": "MQ135",
            "timestamp": now
        })
    elif data["air_quality"] > 900:
        alerts.append({
            "severity": "Medium",
            "title": "Elevated Air Quality Levels",
            "message": "Consider increasing ventilation.",
            "sensor": "MQ135",
            "timestamp": now
        })

    # PM2.5 (PMS5003)
    if data["pm25"] > 50:
        alerts.append({
            "severity": "High",
            "title": "High PM2.5 Levels",
            "message": "Fine particulate matter is high. Use air purifier if available.",
            "sensor": "PMS5003",
            "timestamp": now
        })
    elif data["pm25"] > 35:
        alerts.append({
            "severity": "Medium",
            "title": "Moderate PM2.5 Levels",
            "message": "Particulate matter is above ideal range.",
            "sensor": "PMS5003",
            "timestamp": now
        })

    # Noise (Sound Sensor)
    if data["noise"] > 90:
        alerts.append({
            "severity": "High",
            "title": "Excessive Noise Exposure",
            "message": "Noise levels are too high. Prolonged exposure may cause discomfort.",
            "sensor": "Sound Sensor",
            "timestamp": now
        })
    elif data["noise"] > 75:
        alerts.append({
            "severity": "Medium",
            "title": "Elevated Noise Levels",
            "message": "Noise levels are higher than comfortable.",
            "sensor": "Sound Sensor",
            "timestamp": now
        })

    # Humidity (BME680)
    if data["humidity"] > 75:
        alerts.append({
            "severity": "Medium",
            "title": "High Humidity",
            "message": "High humidity may increase mold growth risk.",
            "sensor": "BME680",
            "timestamp": now
        })

    return alerts
