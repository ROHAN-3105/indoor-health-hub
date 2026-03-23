from prediction_engine import generate_predictions
import json

print("Testing Prediction Engine directly...")
try:
    result = generate_predictions("monacos_room_01")
    print("\n--- Result Summary ---")
    print(f"Model Type: {result.get('model_info', {}).get('type')}")
    print(f"Factors: {result.get('model_info', {}).get('factors_used')}")
    print(f"Forecast Points: {len(result.get('forecast', []))}")
    print(f"Alerts: {len(result.get('alerts', []))}")
    
    if result.get('alerts'):
        print("\nAlerts found:")
        for a in result['alerts']:
            print(f"- {a['message']}")
            
    print("\n✅ Prediction Engine Test Passed")
except Exception as e:
    print(f"\n❌ Prediction Engine Validation Failed: {e}")

print("\nTesting Main API Import...")
try:
    from main import app
    print("✅ Main API Import Passed (Syntax Check)")
except Exception as e:
    print(f"\n❌ Main API Logic Failed: {e}")
