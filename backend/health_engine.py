def calculate_health_score(data: dict):
    score = 100
    reasons = []

    air_quality = data.get("air_quality", 0)
    pm25 = data.get("pm25", 0)
    pm10 = data.get("pm10", 0)
    noise = data.get("noise", 0)
    humidity = data.get("humidity", 0)

    if air_quality > 1000:
        score -= 25
        reasons.append("Elevated CO₂ levels detected")

    if pm25 > 35:
        score -= 20
        reasons.append("High PM2.5 concentration")

    if pm10 > 60:
        score -= 15
        reasons.append("Elevated PM10 levels")

    if noise > 85:
        score -= 20
        reasons.append("Noise exposure exceeds comfort limits")

    if humidity > 70:
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
