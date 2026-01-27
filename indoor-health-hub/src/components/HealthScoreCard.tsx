import { motion } from "framer-motion";
import { useSensor } from "@/contexts/SensorContext";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, Clock } from "lucide-react";

type Level = "Good" | "Moderate" | "Poor" | "Hazardous";

const STATUS_CONFIG: Record<Level, {
  label: string;
  className: string;
  description: string;
}> = {
  Good: {
    label: "Good",
    className: "bg-health-good",
    description: "Air quality is excellent. No action needed.",
  },
  Moderate: {
    label: "Moderate",
    className: "bg-health-moderate",
    description: "Some parameters need attention.",
  },
  Poor: {
    label: "Poor",
    className: "bg-health-poor",
    description: "Indoor environment quality is degraded.",
  },
  Hazardous: {
    label: "Hazardous",
    className: "bg-health-hazardous",
    description: "Immediate action required for safety.",
  },
};

export const HealthScoreCard = () => {
  const { healthScore, loading } = useSensor();

  if (loading || !healthScore) {
    return (
      <div className="rounded-2xl p-6 border border-border/50 bg-muted/20">
        <p className="text-muted-foreground">Waiting for sensor data…</p>
      </div>
    );
  }

  const config =
    healthScore.level && STATUS_CONFIG[healthScore.level]
      ? STATUS_CONFIG[healthScore.level]
      : {
          label: "Unknown",
          className: "bg-muted",
          description: "Waiting for sensor data…",
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl gradient-card p-6 border border-border/50"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-muted-foreground">
            Indoor Health Score
          </h2>
          <p className="text-sm text-muted-foreground/70">
            {config.description}
          </p>
        </div>
        <Activity className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-8 mb-6">
        <div
          className={cn(
            "relative w-32 h-32 rounded-full flex items-center justify-center",
            config.className
          )}
        >
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl font-bold">
                {healthScore.score}
              </span>
              <span className="block text-sm text-muted-foreground">
                /100
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div
            className={cn(
              "inline-flex px-4 py-2 rounded-full text-sm font-semibold text-white",
              config.className
            )}
          >
            {config.label}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            Live calculation
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Based on latest readings
          </div>
        </div>
      </div>
    </motion.div>
  );
};
