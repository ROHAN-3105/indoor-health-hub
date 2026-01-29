import { Fan, Wind, VolumeX, Droplets } from "lucide-react";
import { useSensor } from "@/contexts/SensorContext";
import { Card } from "@/components/ui/card";

const iconMap: Record<string, JSX.Element> = {
  "Use Air Purification": <Wind className="w-4 h-4" />,
  "Reduce Noise Exposure": <VolumeX className="w-4 h-4" />,
  "Improve Cooling": <Fan className="w-4 h-4" />,
  "Reduce Humidity": <Droplets className="w-4 h-4" />,
};

export const RecommendationsPanel = () => {
  const { recommendations } = useSensor();
  if (!recommendations.length) return null;

  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-base font-semibold">Recommended Actions</h3>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl bg-muted/30 p-3"
          >
            <div className="pt-1 text-primary">
              {iconMap[rec.title] ?? <Wind className="w-4 h-4" />}
            </div>

            <div>
              <p className="font-medium">{rec.title}</p>
              <p className="text-sm text-muted-foreground">
                {rec.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
