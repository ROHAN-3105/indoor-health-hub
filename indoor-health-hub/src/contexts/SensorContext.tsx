import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchAQI, AQIResponse } from "@/services/aqiService";

const API_BASE = "http://127.0.0.1:8000/api";
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
  history: HistoryPoint[];
  loading: boolean;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

/* ---------- Provider ---------- */

export const SensorProvider = ({ children }: { children: ReactNode }) => {
  const [latest, setLatest] = useState<SensorData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [aqi, setAqi] = useState<AQIResponse | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [
          latestRes,
          healthRes,
          alertsRes,
          historyRes,
          recsRes,
          aqiData,
        ] = await Promise.all([
          fetch(`${API_BASE}/latest/${DEVICE_ID}`),
          fetch(`${API_BASE}/health-score/${DEVICE_ID}`),
          fetch(`${API_BASE}/alerts/${DEVICE_ID}`),
          fetch(`${API_BASE}/history/${DEVICE_ID}`),
          fetch(`${API_BASE}/recommendations/${DEVICE_ID}`),
          fetchAQI(DEVICE_ID),
        ]);

        if (!mounted) return;

        if (latestRes.ok) setLatest(await latestRes.json());
        if (healthRes.ok) setHealthScore(await healthRes.json());
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (historyRes.ok) setHistory(await historyRes.json());
        if (recsRes.ok) setRecommendations(await recsRes.json());

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
        history,
        loading,
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
