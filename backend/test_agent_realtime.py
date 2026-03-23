from shared_state import DEVICE_STATE
from agent_engine import run_agent
import time

# Simulate live data
DEVICE_ID = "test_device_realtime"
print(f"Setting live memory state for {DEVICE_ID}...")
DEVICE_STATE[DEVICE_ID] = {
    "temperature": 99.9,  # Distinct value to verify
    "humidity": 88.8,
    "pm25": 77.7,
    "pm10": 66.6,
    "noise": 50,
    "light": 100,
    "aqi": 150,
    "air_quality_score": 42
}

print("Running agent...")
response = run_agent("What is the current temperature?", DEVICE_ID)

print("\n--- Agent Response ---")
print(response)

if "99.9" in response:
    print("\n✅ SUCCESS: Agent is reading from in-memory DEVICE_STATE.")
else:
    print("\n❌ FAILURE: Agent is NOT reading from in-memory DEVICE_STATE.")
