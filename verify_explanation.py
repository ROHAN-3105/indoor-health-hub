import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.chdir('backend')

load_dotenv()

from agent_engine import get_live_context

# Mock device ID
device_id = "monacos_room_01"

try:
    context = get_live_context(device_id)
    if "[Model Explanation]" in context:
        print("SUCCESS: Model Explanation found in context.")
        # Print just the explanation part
        start = context.find("[Model Explanation]")
        print(context[start:start+500]) 
    else:
        print("FAILURE: Model Explanation NOT found.")
        print(context)
except Exception as e:
    print(f"Error: {e}")
