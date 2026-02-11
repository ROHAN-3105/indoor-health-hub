import requests
import json
import time

url = "http://localhost:8001/api/ingest"
data = {
    "device_id": "monacos_room_01",
    "temperature": 24.5,
    "humidity": 55.0,
    "pm25": 10.0,
    "pm10": 25.0,
    "noise": 40.0,
    "light": 350.0,
    "pressure": 1012.0,
    "altitude": 500.0,
    "co2": 420.0,
    "vocs": 15.0,
    "aqi": 30.0,
    "air_quality_score": 92.0
}

try:
    print(f"Seeding data to {url}...")
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Failed to seed data: {e}")
