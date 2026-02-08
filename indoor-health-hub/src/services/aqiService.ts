const BASE_URL = "http://127.0.0.1:8000";

export interface AQIResponse {
  aqi: number;
  category: string;
  basis: string;
  components: {
    pm25_aqi?: number;
    pm10_aqi?: number;
    no2_aqi?: number;
  };
}

export async function fetchAQI(deviceId: string): Promise<AQIResponse> {
  const res = await fetch(`${BASE_URL}/api/aqi/${deviceId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch AQI");
  }

  return res.json();
}
