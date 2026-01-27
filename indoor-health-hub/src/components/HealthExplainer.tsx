import { useSensor } from "@/contexts/SensorContext";

const explanations: Record<string, string> = {
  good: "Air quality and comfort levels are within safe limits.",
  moderate: "Some parameters are slightly elevated. Consider ventilation.",
  poor: "Air quality is unhealthy. Immediate action recommended.",
  hazardous: "Dangerous conditions detected. Act immediately.",
};

export const HealthExplainer = () => {
  const { healthScore } = useSensor();

  if (!healthScore) return null;

  return (
    <div className="rounded-xl border p-4 bg-card">
      <h3 className="font-semibold mb-2">Health Insight</h3>
      <p className="text-sm text-muted-foreground">
        {explanations[healthScore.status] ??
          "Health data is being analyzed."}
      </p>
    </div>
  );
};
