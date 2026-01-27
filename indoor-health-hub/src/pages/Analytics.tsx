import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useSensor } from "@/contexts/SensorContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* -------------------- Tabs -------------------- */

const TABS = ["health", "pm25", "tempHumidity", "noise"] as const;
type Tab = (typeof TABS)[number];

/* -------------------- Page -------------------- */

export default function Analytics() {
  const { history, healthScore } = useSensor();
  const [tab, setTab] = useState<Tab>("health");

  /* -------- Transform backend history -------- */
  const data = history.map((d, i) => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    health: healthScore?.score ?? 0,
    pm25: d.pm25,
    temperature: d.temperature,
    humidity: d.humidity,
    noise: d.noise,
  }));

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Live & historical environmental trends
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          <TabButton active={tab === "health"} onClick={() => setTab("health")}>
            Health Score
          </TabButton>
          <TabButton active={tab === "pm25"} onClick={() => setTab("pm25")}>
            PM2.5
          </TabButton>
          <TabButton
            active={tab === "tempHumidity"}
            onClick={() => setTab("tempHumidity")}
          >
            Temp & Humidity
          </TabButton>
          <TabButton active={tab === "noise"} onClick={() => setTab("noise")}>
            Noise
          </TabButton>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 h-[420px]"
        >
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Waiting for sensor data…
            </div>
          ) : (
            <>
              {tab === "health" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="health"
                      stroke="#2dd4bf"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {tab === "pm25" && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="pm25"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {tab === "tempHumidity" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {tab === "noise" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="noise" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}

/* -------------------- Tab Button -------------------- */

const TabButton = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-glow"
          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </button>
  );
};
