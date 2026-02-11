def calculate_health_score(data: dict):
    # Base Score for each category (weighted approach)
    # Total Score = 100
    # Category A: Respiratory Health (Weight: 50 points max)
    # Category B: Thermal Comfort (Weight: 30 points max)
    # Category C: Environmental Stressors (Weight: 20 points max)

    score_a = 50
    score_b = 30
    score_c = 20
    
    reasons = []

    # ==========================================
    # CATEGORY A: RESPIRATORY HEALTH (Max 50)
    # Focus: PM2.5, PM10, CO2, VOCs
    # ==========================================
    
    # PM2.5
    pm25 = data.get("pm25")
    if pm25 is None: pm25 = 0
    
    if pm25 > 35:
        score_a -= 30
        reasons.append(f"High PM2.5 ({pm25})")
    elif pm25 > 15:
        score_a -= 15
        reasons.append(f"Moderate PM2.5 ({pm25})")

    # PM10
    pm10 = data.get("pm10")
    if pm10 is None: pm10 = 0
    
    if pm10 > 100:
        score_a -= 20
        reasons.append(f"High PM10 ({pm10})")
    elif pm10 > 45:
        score_a -= 10
        reasons.append(f"Elevated PM10 ({pm10})")

    # CO2
    co2 = data.get("co2")
    if co2 is None: co2 = 400 # default outdoors

    if co2 > 1200:
        score_a -= 15
        reasons.append(f"High CO2 ({co2})")
    elif co2 > 800:
        score_a -= 5
        reasons.append(f"Poor Ventilation (CO2: {co2})")

    # VOCs
    vocs = data.get("vocs")
    if vocs is None: vocs = 0

    if vocs > 500:
        score_a -= 10
        reasons.append(f"High VOCs ({vocs})")

    # Cap Score A at 0 minimum
    score_a = max(score_a, 0)


    # ==========================================
    # CATEGORY B: THERMAL COMFORT (Max 30)
    # Focus: Temperature & Humidity
    # ==========================================

    # Temperature (Ideal: 20-25)
    temp = data.get("temperature")
    if temp is None: temp = 22

    if temp < 15 or temp > 32:
        score_b -= 20
        reasons.append("Extreme Temp")
    elif temp < 18 or temp > 27:
        score_b -= 10
        reasons.append("Uncomfortable Temp")

    # Humidity (Ideal: 30-60)
    humidity = data.get("humidity")
    if humidity is None: humidity = 50

    if humidity > 70:
        score_b -= 15
        reasons.append("High Humidity (Mold Risk)")
    elif humidity < 30 or humidity > 60:
        score_b -= 10
        reasons.append("Poor Humidity")

    # Cap Score B
    score_b = max(score_b, 0)


    # ==========================================
    # CATEGORY C: ENVIRONMENTAL STRESSORS (Max 20)
    # Focus: Noise & Light
    # ==========================================

    # Noise (Ideal < 45dB)
    noise = data.get("noise")
    if noise is None: noise = 40

    if noise > 75:
        score_c -= 15
        reasons.append("High Noise Stress")
    elif noise > 55:
        score_c -= 5
        reasons.append("Distracting Noise")

    # Light (Ideal 300-500 lux)
    light = data.get("light")
    if light is None: light = 350

    if light < 100:
        score_c -= 5
        reasons.append("Dim Lighting (Strain)")
    elif light > 1000:
        score_c -= 5
        reasons.append("Glare / Bright Light")

    # Cap Score C
    score_c = max(score_c, 0)

    # ==========================================
    # FINAL CALCULATION
    # ==========================================
    
    total_score = score_a + score_b + score_c
    total_score = max(0, min(100, total_score))

    if total_score >= 80:
        level = "Good"
    elif total_score >= 60:
        level = "Moderate"
    elif total_score >= 40:
        level = "Poor"
    else:
        level = "Hazardous"

    return {
        "score": total_score,
        "level": level,
        "reasons": reasons
    }
