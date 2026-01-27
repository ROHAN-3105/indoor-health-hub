export async function fetchAlerts(deviceId: string) {
  const res = await fetch(
    `http://127.0.0.1:8000/api/alerts/${deviceId}`
  );

  if (!res.ok) {
    throw new Error("Device offline");
  }

  return res.json();
}
