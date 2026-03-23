import requests

HF_API_KEY = "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"

API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-small"

headers = {
    "Authorization": f"Bearer {HF_API_KEY}"
}

payload = {
    "inputs": "Explain air quality index in simple terms."
}

print(f"Testing Key: {HF_API_KEY[:5]}...")
print(f"URL: {API_URL}")

try:
    response = requests.post(API_URL, headers=headers, json=payload)
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print(f"Exception: {e}")
