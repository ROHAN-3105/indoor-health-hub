from agent_engine import run_agent
from shared_state import DEVICE_STATE
import os
from dotenv import load_dotenv

load_dotenv()

# Mock device state
DEVICE_ID = "test_openai_device"
DEVICE_STATE[DEVICE_ID] = {
    "temperature": 25.0,
    "humidity": 50.0,
    "pm25": 10.0,
    "aqi": 40,
    "air_quality_score": 90
}

print("Checking for OPENAI_API_KEY...")
if not os.getenv("OPENAI_API_KEY"):
    print("❌ OPENAI_API_KEY not found in env. Test expected to fail elegantly.")
else:
    print("✅ OPENAI_API_KEY found.")

print("\nRunning agent with OpenAI...")
response = run_agent("Is the air quality good?", DEVICE_ID)
print(f"\nResponse: {response}")
