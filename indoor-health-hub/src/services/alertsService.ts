const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchAlerts(deviceId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/alerts/${deviceId}`
  );

  if (!res.ok) {
    throw new Error("Device offline");
  }

  return res.json();
}