import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.chdir('backend')

load_dotenv()

from agent_engine import get_live_context, run_agent

# Mock device ID
device_id = "monacos_room_01"

print("--- Testing Context Generation ---")
try:
    context = get_live_context(device_id)
    print(context)
except Exception as e:
    print(f"Error getting context: {e}")

print("\n--- Testing Agent Response (Prediction) ---")
try:
    response = run_agent("Predict temp in 2 hours", device_id)
    print(f"Agent: {response}")
except Exception as e:
    print(f"Error running agent: {e}")

print("\n--- Testing Agent Response (Explanation) ---")
try:
    response = run_agent("How did you predict that?", device_id)
    print(f"Agent: {response}")
except Exception as e:
    print(f"Error running agent: {e}")
