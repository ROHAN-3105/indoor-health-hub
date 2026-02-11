import asyncio
import json
import aiohttp
from bleak import BleakScanner, BleakClient

# Configuration
# Service UUID and Characteristic UUID from scanner output
SERVICE_UUID = "00001234-0000-1000-8000-00805f9b34fb"
CHARACTERISTIC_UUID = "0000abcd-0000-1000-8000-00805f9b34fb"
DEVICE_NAME = "Monacos_Indoor_Hub"

API_URL = "http://localhost:8001/api/ingest"

async def send_to_api(data):
    """
    Sends the received JSON data to the backend API.
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(API_URL, json=data) as response:
                if response.status == 200:
                    print(f"✅ Data forwarded to API: {data}")
                else:
                    print(f"⚠️ API Error {response.status}: {await response.text()}")
    except Exception as e:
        print(f"❌ Failed to send to API: {e}")

def notification_handler(sender, data):
    """
    Callback for when a BLE notification is received.
    """
    try:
        # Decode bytes to string
        json_str = data.decode('utf-8')
        print(f"📩 Received from BLE: {json_str}")
        
        # Parse JSON
        payload = json.loads(json_str)
        
        # Forward to API asynchronously
        # Since this callback is synchronous, we create a task
        asyncio.create_task(send_to_api(payload))
        
    except Exception as e:
        print(f"Error processing notification: {e}")

async def run():
    print("🔍 Scanning for Monacos Indoor Hub...")
    device = await BleakScanner.find_device_by_filter(
        lambda d, ad: d.name and d.name == DEVICE_NAME
    )

    if not device:
        print(f"❌ Device '{DEVICE_NAME}' not found.")
        return

    print(f"Found device: {device.name} ({device.address})")
    print("Connecting...")

    async with BleakClient(device) as client:
        print(f"✅ Connected to {device.name}")

        # Subscribe to notifications
        await client.start_notify(CHARACTERISTIC_UUID, notification_handler)
        
        print("Waiting for data... (Press Ctrl+C to stop)")
        
        # Keep the script running
        try:
            while True:
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            print("Stopping...")
            await client.stop_notify(CHARACTERISTIC_UUID)

if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        print("\nExited.")
