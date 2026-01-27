import { useSensor } from "@/contexts/SensorContext";

export const RecommendationsPanel = () => {
  const { healthScore } = useSensor();

  if (!healthScore || healthScore.reasons.length === 0) {
    return (
      <div className="glass-card p-4 rounded-xl">
        <h3 className="font-semibold mb-2">Recommendations</h3>
        <p className="text-sm text-muted-foreground">
          Environment is within optimal ranges.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-xl space-y-3">
      <h3 className="font-semibold">Recommendations</h3>
      <ul className="space-y-2">
        {healthScore.reasons.map((r, i) => (
          <li key={i} className="text-sm flex gap-2">
            <span className="mt-2 w-2 h-2 rounded-full bg-primary" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
};
