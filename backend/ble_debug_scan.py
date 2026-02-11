import asyncio
from bleak import BleakScanner, BleakClient

DEVICE_NAME = "Monacos_Indoor_Hub"

async def run():
    print("🔍 Scanning for device...")
    device = await BleakScanner.find_device_by_filter(
        lambda d, ad: d.name and d.name == DEVICE_NAME
    )

    if not device:
        print(f"❌ Device '{DEVICE_NAME}' not found.")
        return

    print(f"✅ Found device: {device.name} ({device.address})")
    print("Connecting to inspect services...")

    async with BleakClient(device) as client:
        print("Connected.")
        print("-" * 20)
        print("Services found:")
        
        for service in client.services:
            print(f"[Service] {service.uuid} ({service.description})")
            for char in service.characteristics:
                props = ",".join(char.properties)
                print(f"   └─ [Char] {char.uuid} ({props})")
                
        print("-" * 20)

if __name__ == "__main__":
    asyncio.run(run())
