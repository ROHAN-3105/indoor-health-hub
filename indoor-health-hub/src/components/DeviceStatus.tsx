import { useSensor } from "@/contexts/SensorContext";

export const DeviceStatus = () => {
  const { latest, loading } = useSensor();

  if (loading || !latest) return null;

  return (
    <div className="text-sm text-muted-foreground">
      <p>Device online</p>
      <p>Last update: {new Date(latest.timestamp).toLocaleTimeString()}</p>
    </div>
  );
};
