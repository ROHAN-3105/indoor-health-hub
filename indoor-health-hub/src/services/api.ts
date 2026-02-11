const BASE_URL = "http://127.0.0.1:8001";

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
