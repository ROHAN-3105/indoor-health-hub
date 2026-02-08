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
import { useState, useEffect } from "react";
import { Activity, Thermometer, Wind, Zap } from "lucide-react";

/* -------------------- Tabs -------------------- */

const TABS = ["health", "pm25", "tempHumidity", "noise"] as const;
type Tab = (typeof TABS)[number];

/* -------------------- Page -------------------- */

export default function Analytics() {
  const { latest, healthScore } = useSensor();
  const [tab, setTab] = useState<Tab>("health");
  const [history, setHistory] = useState<any[]>([]);

  // Fetch 7-day history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/history/monacos_room_01");
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);

  // Merge live data into history view
  const combinedData = [...history];
  if (latest) {
    const lastPoint = history[history.length - 1];
    const latestTime = new Date(latest.timestamp).getTime();
    const lastTime = lastPoint ? new Date(lastPoint.timestamp).getTime() : 0;

    // Ensure we don't duplicate if the timestamp is identical (though unlikely with ms precision)
    // and ensuring it's actually newer
    if (latestTime > lastTime) {
      combinedData.push(latest);
    }
  }

  /* -------- Transform for Recharts -------- */
  const data = combinedData.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    health: healthScore?.score ?? 0,
    pm25: d.pm25,
    temperature: d.temperature,
    humidity: d.humidity,
    noise: d.noise,
  }));

  // Enhanced data with "simulated" health score history for the visual
  const dataWithScore = data.map(p => {
    let score = 100;
    if (p.pm25 > 35) score -= 20;
    if (p.noise > 70) score -= 20;
    if (p.humidity > 65) score -= 10;
    return { ...p, health: Math.max(0, score) };
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold font-display tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Real-time monitoring and 7-day environmental analysis.
          </p>
        </motion.div>

        {/* SECTION 1: LIVE READINGS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Monitor
            </h2>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Updating in real-time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <LiveCard
              title="Health Score"
              value={healthScore?.score.toString() ?? "--"}
              unit="/ 100"
              icon={<Activity className="w-5 h-5 text-emerald-500" />}
              trend="Based on all sensors"
              color="emerald"
            />
            <LiveCard
              title="Air Quality (PM2.5)"
              value={latest?.pm25.toFixed(1) ?? "--"}
              unit="µg/m³"
              icon={<Wind className="w-5 h-5 text-amber-500" />}
              trend={latest?.pm25 > 35 ? "Poor Quality" : "Good Quality"}
              color="amber"
            />
            <LiveCard
              title="Temperature"
              value={latest?.temperature.toFixed(1) ?? "--"}
              unit="°C"
              icon={<Thermometer className="w-5 h-5 text-rose-500" />}
              trend={`Humidity: ${latest?.humidity.toFixed(0)}%`}
              color="rose"
            />
            <LiveCard
              title="Noise Level"
              value={latest?.noise.toFixed(1) ?? "--"}
              unit="dB"
              icon={<Zap className="w-5 h-5 text-orange-500" />}
              trend={latest?.noise > 70 ? "High Noise" : "Quiet"}
              color="orange"
            />
          </div>
        </section>

        {/* SECTION 2: HISTORICAL TRENDS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Historical Trends (7 Days)</h2>

            {/* Tabs */}
            <div className="flex p-1 bg-muted/30 rounded-full w-fit">
              <TabButton active={tab === "health"} onClick={() => setTab("health")}>
                Health
              </TabButton>
              <TabButton active={tab === "pm25"} onClick={() => setTab("pm25")}>
                PM2.5
              </TabButton>
              <TabButton
                active={tab === "tempHumidity"}
                onClick={() => setTab("tempHumidity")}
              >
                Climate
              </TabButton>
              <TabButton active={tab === "noise"} onClick={() => setTab("noise")}>
                Noise
              </TabButton>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 h-[500px] border border-white/5 shadow-xl bg-gradient-to-b from-white/5 to-transparent"
          >
            {dataWithScore.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p>Loading historical data...</p>
              </div>
            ) : (
              <>
                {tab === "health" && (
                  <GraphContainer>
                    <LineChart data={dataWithScore}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis dataKey="time" minTickGap={60} tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="health"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </GraphContainer>
                )}

                {tab === "pm25" && (
                  <GraphContainer>
                    <AreaChart data={dataWithScore}>
                      <defs>
                        <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis dataKey="time" minTickGap={60} tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="pm25"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fill="url(#colorPm25)"
                      />
                    </AreaChart>
                  </GraphContainer>
                )}

                {tab === "tempHumidity" && (
                  <GraphContainer>
                    <LineChart data={dataWithScore}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis dataKey="time" minTickGap={60} tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </GraphContainer>
                )}

                {tab === "noise" && (
                  <GraphContainer>
                    <BarChart data={dataWithScore}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis dataKey="time" minTickGap={60} tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="noise" fill="#f97316" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </GraphContainer>
                )}
              </>
            )}
          </motion.div>
        </section>
      </main>
    </div>
  );
}

/* -------------------- Sub-Components -------------------- */
const LiveCard = ({ title, value, unit, icon, trend, color }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-5 rounded-xl border border-white/5 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-muted-foreground text-sm font-medium">{title}</span>
      <div className={`p-2 rounded-lg bg-${color}-500/10`}>
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold font-display">{value}</span>
      <span className="text-sm text-muted-foreground font-medium">{unit}</span>
    </div>
    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{trend}</span>
    </div>
  </motion.div>
);

const TabButton = ({ active, children, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
      active
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
    )}
  >
    {children}
  </button>
);

const GraphContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full h-full">
    <ResponsiveContainer width="100%" height="100%">
      {children as any}
    </ResponsiveContainer>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-mono font-medium">{Number(entry.value).toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
