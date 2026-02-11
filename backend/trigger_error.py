import sys
import os
import traceback

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from agent_engine import run_agent
    print("Testing agent...")
    response = run_agent("hi", "monacos_room_01")
    print(response)
except Exception:
    traceback.print_exc()
