export interface SensorData {
  device_id: string;
  location?: string;
  timestamp: string;

  temperature: number;
  humidity: number;
  pm25: number;
  pm10: number;
  noise: number;
  light: number;
}

export interface HealthScore {
  score: number;
  label: "Good" | "Moderate" | "Poor" | "Hazardous";
  reasons: string[];
}
