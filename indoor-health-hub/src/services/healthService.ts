const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchHealthScore(deviceId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/health-score/${deviceId}`
  );

  if (!res.ok) {
    throw new Error("Health score fetch failed");
  }

  return res.json();
}