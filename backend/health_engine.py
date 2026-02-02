def calculate_health_score(data: dict):
    score = 100
    reasons = []

    # -----------------------------
    # PM2.5 (Particulate Matter)
    # -----------------------------
    if data.get("pm25", 0) > 35:
        score -= 20
        reasons.append("High PM2.5 concentration")
    elif data.get("pm25", 0) > 15:
        score -= 5
        reasons.append("Moderate PM2.5 levels")

    # -----------------------------
    # PM10
    # -----------------------------
    if data.get("pm10", 0) > 50:
        score -= 15
        reasons.append("Elevated PM10 levels")

    # -----------------------------
    # Noise
    # -----------------------------
    if data.get("noise", 0) > 70:
        score -= 15
        reasons.append("Noise environment is loud")
    
    # -----------------------------
    # Humidity (40-60 is ideal)
    # -----------------------------
    humidity = data.get("humidity", 50) # default to ideal if missing
    if humidity > 65:
        score -= 10
        reasons.append("High humidity (Mold risk)")
    elif humidity < 30:
        score -= 10
        reasons.append("Air is too dry")

    # -----------------------------
    # Temperature (20-25 is ideal)
    # -----------------------------
    temp = data.get("temperature", 22) # default to ideal
    if temp > 28:
        score -= 15
        reasons.append("Room is too hot")
    elif temp < 18:
        score -= 15
        reasons.append("Room is too cold")

    # -----------------------------
    # Light (Optional context)
    # -----------------------------
    # Hard to score without time of day, but < 50 is dark
    if data.get("light", 100) < 50:
         # Small penalty, maybe it's just night time? 
         # Let's not penalize health score too much for light unless strictly needed.
         pass

    score = max(score, 0)
    score = min(score, 100) # Cap at 100 just in case

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
