import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Wifi,
  WifiOff,
  Thermometer,
  Wind,
  Volume2,
  Sun,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

/* ---------------- Types ---------------- */

type DeviceStatus = "online" | "offline";

interface Device {
  device_id: string;
  last_seen: string;
  status: DeviceStatus;

  temperature?: number;
  pm25?: number;
  noise?: number;
  light?: number;
}


/* ---------------- Page ---------------- */

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(`${API_BASE}/devices`);
        const list = await res.json();

        if (!Array.isArray(list)) {
          setDevices([]);
          return;
        }

        // enrich device cards with live metrics
        const enriched = await Promise.all(
          list.map(async (d: any) => {
            try {
              const latestRes = await fetch(
                `${API_BASE}/latest/${d.device_id}`
              );
              if (!latestRes.ok) throw new Error();

              const latest = await latestRes.json();
             return {
  device_id: d.device_id,
  last_seen: d.last_seen,
  status: "online" as const,
  temperature: latest.temperature,
  pm25: latest.pm25,
  noise: latest.noise,
  light: latest.light,
};

            } catch {
             return {
  device_id: d.device_id,
  last_seen: d.last_seen,
  status: "offline" as const,
};

            }
          })
        );

        setDevices(enriched);
      } catch (err) {
        console.error("Failed to fetch devices", err);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold font-display">Devices</h1>
          <p className="text-muted-foreground">
            Live indoor monitoring units connected to Monacos
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <p className="text-muted-foreground">Discovering devices…</p>
        )}

        {/* Empty */}
        {!loading && devices.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-lg font-medium mb-2">No devices online</p>
            <p className="text-sm text-muted-foreground">
              Start hardware or send data via Postman to see devices here.
            </p>
          </div>
        )}

        {/* Device Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {devices.map((d, i) => {
            const online = d.status === "online";

            return (
              <motion.div
                key={d.device_id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "relative rounded-3xl p-6 glass-card border border-border/50 overflow-hidden",
                  online && "shadow-glow"
                )}
              >
                {/* Glow */}
                {online && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold capitalize">
                      {d.device_id.replaceAll("_", " ")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Indoor Monitoring Unit
                    </p>
                  </div>

                  <span
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                      online
                        ? "bg-health-good/20 text-health-good"
                        : "bg-health-poor/20 text-health-poor"
                    )}
                  >
                    {online ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                    {online ? "Online" : "Offline"}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Metric
                    icon={<Thermometer />}
                    label="Temperature"
                    value={
                      d.temperature !== undefined
                        ? `${d.temperature.toFixed(1)} °C`
                        : "--"
                    }
                  />
                  <Metric
                    icon={<Wind />}
                    label="PM2.5"
                    value={
                      d.pm25 !== undefined
                        ? `${d.pm25.toFixed(1)} µg/m³`
                        : "--"
                    }
                  />
                  <Metric
                    icon={<Volume2 />}
                    label="Noise"
                    value={
                      d.noise !== undefined
                        ? `${d.noise.toFixed(1)} dB`
                        : "--"
                    }
                  />
                  <Metric
                    icon={<Sun />}
                    label="Light"
                    value={
                      d.light !== undefined
                        ? `${d.light.toFixed(0)} lux`
                        : "--"
                    }
                  />
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Last update:{" "}
                    {d.last_seen
                      ? new Date(d.last_seen).toLocaleTimeString()
                      : "—"}
                  </span>

                  <Link
                    to={`/devices/${d.device_id}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    View details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Metric ---------------- */

const Metric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-muted/40 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);
