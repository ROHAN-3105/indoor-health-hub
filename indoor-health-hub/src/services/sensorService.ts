const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchLatestSensorData(deviceId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/latest/${deviceId}`
  );

  if (!res.ok) {
    throw new Error("Sensor fetch failed");
  }

  return res.json();
}