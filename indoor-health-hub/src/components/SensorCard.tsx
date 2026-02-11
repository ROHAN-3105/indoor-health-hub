import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Thermometer,
  Droplets,
  Wind,
  Volume2,
  Sun,
  Activity,
  Cloud,
  Gauge,
  Mountain,
} from "lucide-react";
import { useMemo } from "react";

interface SensorCardProps {
  title: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  status: "good" | "moderate" | "poor";
  updatedAt?: string;
}

const statusStyles = {
  good: "text-health-good",
  moderate: "text-health-moderate",
  poor: "text-health-poor",
};

const bgStyles = {
  good: "bg-health-good",
  moderate: "bg-health-moderate",
  poor: "bg-health-poor",
};

const formatUpdatedAgo = (timestamp?: string) => {
  if (!timestamp) return null;

  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  );

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  return `${Math.floor(diffSeconds / 3600)}h ago`;
};

export const SensorCard = ({
  title,
  value,
  unit,
  icon,
  status,
  updatedAt,
}: SensorCardProps) => {
  const updatedLabel = useMemo(
    () => formatUpdatedAgo(updatedAt),
    [updatedAt]
  );

  const textColor = statusStyles[status] || "text-gray-400";
  const bgColor = bgStyles[status] || "bg-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative rounded-2xl p-5 border border-white/5 bg-[var(--card)] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* subtle live pulse */}
      <motion.div
        key={updatedAt}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-400">
          {title}
        </span>
        <div className={cn("p-2 rounded-xl bg-opacity-10", bgColor)}>
          <div className={cn("h-4 w-4", textColor)}>{icon}</div>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {value ?? "--"}
        </span>
        <span className="text-sm mb-1 text-gray-500">{unit}</span>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={cn("capitalize font-medium", textColor)}>● {status}</span>
        {updatedLabel && (
          <span className="text-gray-500">
            {updatedLabel}
          </span>
        )}
      </div>
    </motion.div>
  );
};

/* ---------- ICON HELPERS ---------- */

export const sensorIcons = {
  temperature: <Thermometer className="w-5 h-5" />,
  humidity: <Droplets className="w-5 h-5" />,
  pm25: <Wind className="w-5 h-5" />,
  pm10: <Wind className="w-5 h-5" />,
  noise: <Volume2 className="w-5 h-5" />,
  light: <Sun className="w-5 h-5" />,
  health: <Activity className="w-5 h-5" />,
  pressure: <Gauge className="w-5 h-5" />,
  altitude: <Mountain className="w-5 h-5" />,
  co2: <Cloud className="w-5 h-5" />,
  vocs: <Wind className="w-5 h-5" />,
};
