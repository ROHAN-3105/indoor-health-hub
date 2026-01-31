import { motion, AnimatePresence } from "framer-motion";
import { useSensor } from "@/contexts/SensorContext";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bell, CheckCircle } from "lucide-react";

/* ---------------- Types ---------------- */

type Severity = "High" | "Medium" | "Low";

type AlertFromAPI = {
  id?: string; // backend may or may not send
  severity: Severity;
  title: string;
  message: string;
  sensor: string;
  timestamp: string;
};

type AlertUI = AlertFromAPI & {
  id: string;
};

/* ---------------- Helpers ---------------- */

const getAlertStyles = (severity: Severity) => {
  switch (severity) {
    case "High":
      return "border-health-hazardous bg-health-hazardous/10";
    case "Medium":
      return "border-health-poor bg-health-poor/10";
    case "Low":
      return "border-health-moderate bg-health-moderate/10";
    default:
      return "border-border bg-card";
  }
};

const getAlertIcon = (severity: Severity) => {
  switch (severity) {
    case "High":
      return <AlertTriangle className="w-5 h-5 text-health-hazardous" />;
    case "Medium":
      return <AlertTriangle className="w-5 h-5 text-health-poor" />;
    case "Low":
      return <AlertTriangle className="w-5 h-5 text-health-moderate" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

/* ---------------- Component ---------------- */

export const AlertsPanel = () => {
  const { alerts, loading } = useSensor(); // ❌ NO CASTING

  // ✅ normalize alerts safely
  const normalizedAlerts: AlertUI[] = alerts.map((alert: AlertFromAPI) => ({
    ...alert,
    id:
      alert.id ??
      `${alert.sensor}-${alert.severity}-${alert.timestamp}`,
  }));

  if (loading) {
    return (
      <div className="rounded-2xl gradient-card p-6 border border-border/50 text-muted-foreground">
        Loading alerts…
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl gradient-card p-6 border border-border/50"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-health-hazardous/20">
          <Bell className="w-5 h-5 text-health-hazardous" />
        </div>

        <h3 className="text-lg font-semibold font-display">Alerts</h3>

        {normalizedAlerts.length > 0 && (
          <span className="ml-auto text-xs font-medium px-2 py-1 bg-health-hazardous/20 text-health-hazardous rounded-full animate-pulse">
            {normalizedAlerts.length} active
          </span>
        )}
      </div>

      {/* Empty state */}
      {normalizedAlerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-health-good/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-health-good" />
          </div>
          <p>No active alerts</p>
          <p className="text-sm mt-1">Your environment is healthy</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {normalizedAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.08 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  getAlertStyles(alert.severity)
                )}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.severity)}

                  <div className="flex-1">
                    <p className="text-sm font-semibold">{alert.title}</p>

                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      <span>•</span>
                      <span>{alert.sensor}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
