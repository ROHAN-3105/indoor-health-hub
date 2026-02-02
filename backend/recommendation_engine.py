def generate_recommendations(data: dict):
    recs = []

    pm25 = data.get("pm25", 0)
    pm10 = data.get("pm10", 0)
    noise = data.get("noise", 0)
    temperature = data.get("temperature", 0)
    humidity = data.get("humidity", 0)
    light = data.get("light", 0)

    # -------------------------------
    # Air Quality (PM-based)
    # -------------------------------
    if pm25 > 35 or pm10 > 75:
        recs.append({
            "title": "Improve Air Quality",
            "action": "Run an air purifier on high or ventilate if outdoor air is clean.",
            "priority": "high",
            "icon": "wind"
        })
    elif pm25 > 15:
        recs.append({
            "title": "Monitor Air Quality",
            "action": "Air quality is moderate. Keep windows closed if traffic is heavy.",
            "priority": "medium",
            "icon": "wind"
        })

    # -------------------------------
    # Noise
    # -------------------------------
    if noise > 80:
        recs.append({
            "title": "Reduce Noise",
            "action": "Noise levels are hazardous. Wear protection or isolate source.",
            "priority": "high",
            "icon": "volume-x"
        })
    elif noise > 70:
        recs.append({
            "title": "Quiet Down Environment",
            "action": "Background noise is intrusive. Consider soundproofing.",
            "priority": "medium",
            "icon": "volume-1"
        })

    # -------------------------------
    # Temperature
    # -------------------------------
    if temperature > 28:
        recs.append({
            "title": "Cool Down Room",
            "action": "Temperature is above comfort zone. Use fans or AC.",
            "priority": "medium",
            "icon": "thermometer"
        })
    elif temperature < 18:
        recs.append({
            "title": "Increase Heating",
            "action": "Room is too cold. Check heating system.",
            "priority": "medium",
            "icon": "thermometer"
        })

    # -------------------------------
    # Humidity (40-60 is ideal)
    # -------------------------------
    if humidity > 65:
        recs.append({
            "title": "Dehumidify",
            "action": "High humidity detected. Ventilate or use a dehumidifier to prevent mold.",
            "priority": "medium",
            "icon": "droplet"
        })
    elif humidity < 30:
        recs.append({
            "title": "Humidify Air",
            "action": "Air is too dry. Use a humidifier or add plants.",
            "priority": "low",
            "icon": "droplet"
        })

    # -------------------------------
    # Lighting
    # -------------------------------
    if light < 50:
        recs.append({
            "title": "Improve Lighting",
            "action": "Light levels are low. Open blinds or turn on lights if working.",
            "priority": "low",
            "icon": "sun"
        })

    # -------------------------------
    # Fallback
    # -------------------------------
    if not recs:
        recs.append({
            "title": "Optimal Conditions",
            "action": "Environment is comfortable and healthy.",
            "priority": "low",
            "icon": "check"
        })

    return recs
