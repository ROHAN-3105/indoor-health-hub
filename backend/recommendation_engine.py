def generate_recommendations(data: dict):
    recs = []

    if data["pm25"] > 35:
        recs.append({
            "title": "Improve Air Quality",
            "message": "Increase ventilation or use an air purifier."
        })

    if data["noise"] > 85:
        recs.append({
            "title": "Reduce Noise Exposure",
            "message": "Lower volume or move to a quieter environment."
        })

    if data["temperature"] > 35:
        recs.append({
            "title": "High Temperature",
            "message": "Turn on cooling or improve airflow."
        })

    if data["humidity"] < 30:
        recs.append({
            "title": "Low Humidity",
            "message": "Use a humidifier to improve comfort."
        })

    return recs
