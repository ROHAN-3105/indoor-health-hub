const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchLatestData() {
  const res = await fetch(`${BASE_URL}/api/latest`);
  return res.json();
}

export async function fetchHealthScore() {
  const res = await fetch(`${BASE_URL}/api/health-score`);
  return res.json();
}

export async function setDemoScenario(scenario: string) {
  await fetch(`${BASE_URL}/api/demo-scenario/${scenario}`, {
    method: "POST",
  });
}