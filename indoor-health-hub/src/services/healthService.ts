export async function fetchHealthScore(deviceId: string) {
  const res = await fetch(
    `http://127.0.0.1:8001/api/health-score/${deviceId}`
  );
  if (!res.ok) throw new Error("Health score fetch failed");
  return res.json();
}
