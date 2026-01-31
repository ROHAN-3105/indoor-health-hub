def calculate_health_score(data: dict):
    score = 100
    reasons = []

    if data.get("pm25", 0) > 35:
        score -= 20
        reasons.append("High PM2.5 concentration")

    if data.get("pm10", 0) > 50:
        score -= 20
        reasons.append("Elevated PM10 levels")

    if data.get("noise", 0) > 70:
        score -= 20
        reasons.append("Noise exposure exceeds comfort limits")

    if data.get("humidity", 0) > 65:
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
