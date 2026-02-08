import { motion } from "framer-motion";
import { useSensor } from "@/contexts/SensorContext";
import { Activity, TrendingUp, Clock } from "lucide-react";

type Level = "Good" | "Moderate" | "Poor" | "Hazardous";

const STATUS_CONFIG: Record<Level, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  Good: {
    label: "Good",
    className: "bg-health-good",
    icon: <Activity className="w-4 h-4" />,
  },
  Moderate: {
    label: "Moderate",
    className: "bg-health-moderate",
    icon: <Activity className="w-4 h-4" />,
  },
  Poor: {
    label: "Poor",
    className: "bg-health-poor",
    icon: <Activity className="w-4 h-4" />,
  },
  Hazardous: {
    label: "Hazardous",
    className: "bg-health-hazardous",
    icon: <Activity className="w-4 h-4" />,
  },
};

export const HealthScoreCard = () => {
  const { healthScore, loading } = useSensor();

  if (loading || !healthScore) {
    return (
      <div className="rounded-[2rem] p-8 border border-border/50 bg-muted/20 animate-pulse h-64">
        <p className="text-muted-foreground">Loading health score...</p>
      </div>
    );
  }

  // Fallback if level is undefined or invalid
  const level = (healthScore.level as Level) || "Moderate";
  const config = STATUS_CONFIG[level] || STATUS_CONFIG.Moderate;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-purple p-8 text-white shadow-xl min-h-[300px]"
    >
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-64 w-64 rounded-full bg-black/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid gap-8 md:grid-cols-2 items-center h-full">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-white/80" />
            <h2 className="text-lg font-medium text-white/90">Overall Health Score</h2>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-bold tracking-tight font-display">
              {Math.round(healthScore.score)}
            </span>
            <span className="text-xl text-white/60">/ 100</span>
          </div>

          <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-md">
            {config.icon}
            <span className="ml-2">{config.label}</span>
          </div>

          <p className="text-white/80 leading-relaxed max-w-md">
            Your environment aligns with <span className="font-semibold text-white">WHO & ASHRAE</span> standards.
            Maintain these levels for optimal cognitive function.
          </p>
        </div>

        {/* Decorative Ring Logic */}
        <div className="hidden md:flex justify-end relative items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray={502}
                strokeDashoffset={502 - (502 * healthScore.score) / 100}
                className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-bold text-white">{Math.round(healthScore.score)}%</span>
              <span className="block text-xs text-white/60">Health</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-8 flex gap-6 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>Live Trend</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Real-time</span>
        </div>
      </div>
    </motion.div>
  );
};
