export interface Alert {
  id: string;
  severity: "Low" | "Medium" | "High";
  title: string;
  message: string;
  sensor: string;
  timestamp: string;
  acknowledged?: boolean;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  co2: number;
  pm25: number;
  pm10: number;
  voc: number;
  noise: number;
  light: number;
}
