import requests

try:
    response = requests.get("http://127.0.0.1:8001/api/export/monacos_room_01")
    print("Status:", response.status_code)
    print("Text:", response.text[:200])
except Exception as e:
    print("Error:", e)
