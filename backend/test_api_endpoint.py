import requests
import json

url = "http://localhost:8000/api/chat"
payload = {
    "message": "hello",
    "device_id": "monacos_room_01"
}
headers = {
    "Content-Type": "application/json"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    with open("api_response.txt", "w") as f:
        f.write(response.text)
except Exception as e:
    print(f"Request failed: {e}")
