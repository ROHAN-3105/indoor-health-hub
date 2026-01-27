import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

const API_BASE = "http://127.0.0.1:8000/api";

export default function DeviceDetails() {
  const { id } = useParams();
  const [latest, setLatest] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      try {
        const [l, h] = await Promise.all([
          fetch(`${API_BASE}/latest/${id}`),
          fetch(`${API_BASE}/history/${id}`),
        ]);

        if (l.ok) setLatest(await l.json());
        if (h.ok) setHistory(await h.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const i = setInterval(fetchAll, 5000);
    return () => clearInterval(i);
  }, [id]);

  if (loading) {
    return <p className="p-8 text-muted-foreground">Loading device…</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold capitalize">
            {id?.replaceAll("_", " ")}
          </h1>
          <p className="text-muted-foreground">Live device telemetry</p>
        </motion.div>

        {/* Live Metrics */}
        {latest && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Metric label="Temperature" value={`${latest.temperature} °C`} />
            <Metric label="Humidity" value={`${latest.humidity} %`} />
            <Metric label="PM2.5" value={`${latest.pm25} µg/m³`} />
            <Metric label="Noise" value={`${latest.noise} dB`} />
          </div>
        )}

        {/* History Chart */}
        <div className="glass-card rounded-3xl p-6 h-[420px]">
          <h3 className="font-semibold mb-4">PM2.5 History</h3>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) =>
                  new Date(v).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(v) =>
                  new Date(v).toLocaleTimeString()
                }
              />
              <Line
                type="monotone"
                dataKey="pm25"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="glass-card rounded-2xl p-5">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
);
