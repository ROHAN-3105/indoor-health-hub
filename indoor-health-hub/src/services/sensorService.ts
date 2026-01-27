export async function fetchLatestSensorData(deviceId: string) {
  const res = await fetch(`http://127.0.0.1:8000/api/latest/${deviceId}`);
  if (!res.ok) throw new Error("Sensor fetch failed");
  return res.json();
}
