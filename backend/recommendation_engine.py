def generate_recommendations(data: dict):
    recs = []

    pm25 = data.get("pm25", 0)
    pm10 = data.get("pm10", 0)
    noise = data.get("noise", 0)
    temperature = data.get("temperature", 0)
    humidity = data.get("humidity", 0)

    # -------------------------------
    # Air Quality (PM-based)
    # -------------------------------
    if pm25 > 55 or pm10 > 100:
        recs.append({
            "title": "Use Air Purification",
            "action": "Run an air purifier or improve cross-ventilation.",
            "priority": "high",
            "icon": "air"
        })
    elif pm25 > 35 or pm10 > 50:
        recs.append({
            "title": "Ventilate the Room",
            "action": "Open windows or reduce indoor dust sources.",
            "priority": "medium",
            "icon": "wind"
        })

    # -------------------------------
    # Noise
    # -------------------------------
    if noise > 85:
        recs.append({
            "title": "Reduce Noise Exposure",
            "action": "Lower volume or relocate to a quieter space.",
            "priority": "high",
            "icon": "volume-x"
        })

    # -------------------------------
    # Temperature
    # -------------------------------
    if temperature > 35:
        recs.append({
            "title": "Improve Cooling",
            "action": "Turn on fans or increase airflow.",
            "priority": "medium",
            "icon": "thermometer"
        })
    elif temperature < 18:
        recs.append({
            "title": "Increase Warmth",
            "action": "Adjust heating to maintain comfort.",
            "priority": "low",
            "icon": "thermometer"
        })

    # -------------------------------
    # Humidity
    # -------------------------------
    if humidity > 70:
        recs.append({
            "title": "Reduce Humidity",
            "action": "Use a dehumidifier or ventilate damp areas.",
            "priority": "medium",
            "icon": "droplet"
        })
    elif humidity < 30:
        recs.append({
            "title": "Increase Humidity",
            "action": "Use a humidifier for better comfort.",
            "priority": "low",
            "icon": "droplet"
        })

    # -------------------------------
    # Fallback
    # -------------------------------
    if not recs:
        recs.append({
            "title": "Maintain Current Conditions",
            "action": "Indoor environment is stable.",
            "priority": "low",
            "icon": "check"
        })

    return recs
