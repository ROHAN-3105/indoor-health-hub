import requests
import time
import concurrent.futures

def send_request(i):
    print(f"Request {i} sending...")
    try:
        start = time.time()
        resp = requests.post("http://localhost:8000/api/chat", json={
            "message": "Hello from stress test",
            "device_id": "monacos_room_01"
        })
        elapsed = time.time() - start
        print(f"Request {i} done in {elapsed:.2f}s. Status: {resp.status_code}. Content: {resp.text[:100]}")
        return resp.status_code, resp.text
    except Exception as e:
        print(f"Request {i} failed: {e}")
        return 0, str(e)

if __name__ == "__main__":
    # Send 5 requests currently to trigger potential rate limits if no retry
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(send_request, i) for i in range(5)]
        results = [f.result() for f in futures]
    
    print("Test Complete")
