
import sys
import os

# Add backend directory to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from backend.main import app
    print("✅ Successfully imported FastAPI app from backend.main")
except Exception as e:
    print(f"❌ Failed to import backend.main: {e}")
    import traceback
    traceback.print_exc()
