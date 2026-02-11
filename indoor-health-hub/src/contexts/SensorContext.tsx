import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchAQI, AQIResponse } from "@/services/aqiService";

const API_BASE = "http://127.0.0.1:8001/api";
const DEVICE_ID = "monacos_room_01";

/* ---------- Types ---------- */

export interface SensorData {
  device_id: string;
  temperature: number;
  humidity: number;
  pm25: number;
  pm10: number;
  air_quality: number;
  noise: number;
  light: number;
  altitude: number;
  pressure: number;
  co2: number;
  vocs: number;
  aqi: number;
  air_quality_score: number;
  timestamp: string;
}

export type HealthLevel = "Good" | "Moderate" | "Poor" | "Hazardous";

export interface HealthScore {
  score: number;
  level: HealthLevel;
  reasons: string[];
}

export interface Alert {
  severity: string;
  title: string;
  message: string;
  sensor: string;
  timestamp: string;
}

export interface Recommendation {
  title: string;
  action: string;
  priority: "low" | "medium" | "high";
  basis?: string;
}

export interface HistoryPoint {
  temperature: number;
  humidity: number;
  pm25: number;
  pm10: number;
  noise: number;
  light: number;
  air_quality: number;
  timestamp: string;
}

/* ---------- Context ---------- */

interface SensorContextType {
  latest: SensorData | null;
  healthScore: HealthScore | null;
  aqi: AQIResponse | null;
  alerts: Alert[];
  recommendations: Recommendation[];
  loading: boolean;
  injectSensorData: (data: Partial<SensorData>) => void;
  historicalData: HistoryPoint[];
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

/* ---------- Provider ---------- */

export const SensorProvider = ({ children }: { children: ReactNode }) => {
  const [latest, setLatest] = useState<SensorData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [aqi, setAqi] = useState<AQIResponse | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Allow external sources (like Bluetooth) to update state
  const injectSensorData = (data: Partial<SensorData>) => {
    setLatest((prev) => {
      const timestamp = new Date().toISOString();
      const newData = !prev
        ? {
          device_id: DEVICE_ID,
          temperature: 0,
          humidity: 0,
          pm25: 0,
          pm10: 0,
          air_quality: 0,
          noise: 0,
          light: 0,
          altitude: 0,
          pressure: 0,
          co2: 0,
          vocs: 0,
          aqi: 0,
          air_quality_score: 0,
          timestamp,
          ...data,
        }
        : { ...prev, ...data, timestamp };

      // Update history with new data point
      setHistoricalData(prevHist => {
        const point: HistoryPoint = {
          temperature: newData.temperature,
          humidity: newData.humidity,
          pm25: newData.pm25,
          pm10: newData.pm10,
          noise: newData.noise,
          light: newData.light,
          air_quality: newData.air_quality,
          timestamp: newData.timestamp
        };
        // Keep last 24 points e.g.
        return [...prevHist, point].slice(-24);
      });

      return newData;
    });
  };

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [
          latestRes,
          healthRes,
          alertsRes,
          recsRes,
          aqiData,
          historyRes // Assuming there is an endpoint or we mock it
        ] = await Promise.all([
          fetch(`${API_BASE}/latest/${DEVICE_ID}`),
          fetch(`${API_BASE}/health-score/${DEVICE_ID}`),
          fetch(`${API_BASE}/alerts/${DEVICE_ID}`),
          fetch(`${API_BASE}/recommendations/${DEVICE_ID}`),
          fetchAQI(DEVICE_ID),
          fetch(`${API_BASE}/history/${DEVICE_ID}`).catch(() => ({ ok: false, json: async () => [] })) // Fallback
        ]);

        if (!mounted) return;

        if (latestRes.ok) setLatest(await latestRes.json());
        if (healthRes.ok) setHealthScore(await healthRes.json());
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (recsRes.ok) setRecommendations(await recsRes.json());
        // For history, if the endpoint doesn't exist yet, we can rely on injected data or empty
        if (historyRes.ok) setHistoricalData(await historyRes.json());

        setAqi(aqiData);
      } catch (err) {
        console.error("Sensor fetch failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <SensorContext.Provider
      value={{
        latest,
        healthScore,
        aqi,
        alerts,
        recommendations,
        loading,
        injectSensorData,
        historicalData
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

/* ---------- Hook ---------- */

export const useSensor = () => {
  const ctx = useContext(SensorContext);
  if (!ctx) {
    throw new Error("useSensor must be used inside SensorProvider");
  }
  return ctx;
};
