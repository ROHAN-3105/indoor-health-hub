import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Thermometer,
  Droplets,
  Wind,
  Volume2,
  Sun,
  Activity,
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
  good: "border-health-good bg-health-good/10 text-health-good",
  moderate:
    "border-health-moderate bg-health-moderate/10 text-health-moderate",
  poor: "border-health-poor bg-health-poor/10 text-health-poor",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative rounded-2xl p-5 border backdrop-blur-xl shadow-lg transition-all",
        statusStyles[status]
      )}
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
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="opacity-80">{icon}</div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight">
          {value ?? "--"}
        </span>
        <span className="text-sm mb-1 text-muted-foreground">{unit}</span>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="capitalize">{status}</span>
        {updatedLabel && (
          <span className="text-muted-foreground">
            Updated {updatedLabel}
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
};
