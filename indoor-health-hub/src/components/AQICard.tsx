import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSensor } from "@/contexts/SensorContext";
import { Wind } from "lucide-react";
import clsx from "clsx";

const aqiStyles: Record<
  string,
  { ring: string; badge: string; text: string }
> = {
  Good: {
    ring: "ring-green-500/40",
    badge: "bg-green-600",
    text: "Air quality is satisfactory with minimal health risk.",
  },
  Moderate: {
    ring: "ring-yellow-500/40",
    badge: "bg-yellow-500",
    text: "Sensitive individuals may experience mild effects.",
  },
  Poor: {
    ring: "ring-orange-500/40",
    badge: "bg-orange-600",
    text: "Air quality may affect comfort and breathing.",
  },
  Unhealthy: {
    ring: "ring-red-500/40",
    badge: "bg-red-600",
    text: "Increased risk of adverse health effects.",
  },
  Hazardous: {
    ring: "ring-red-800/50",
    badge: "bg-red-800",
    text: "Serious health risk. Avoid prolonged exposure.",
  },
};

export const AQICard = () => {
  const { aqi, loading } = useSensor();

  if (loading || !aqi) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Calculating Air Quality Index…
        </CardContent>
      </Card>
    );
  }

  const style = aqiStyles[aqi.category] ?? aqiStyles.Moderate;

  return (
    <Card
      className={clsx(
        "relative overflow-hidden ring-1 transition-all",
        style.ring
      )}
    >
      {/* Subtle background wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-transparent" />

      <CardContent className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Air Quality Index</h3>
          </div>

          <Badge className={style.badge}>{aqi.category}</Badge>
        </div>

        {/* AQI Value */}
        <div className="flex items-end gap-3">
          <span className="text-5xl font-bold tracking-tight">
            {aqi.aqi}
          </span>
          <span className="text-sm text-muted-foreground pb-1">
            AQI
          </span>
        </div>

        {/* Interpretation */}
        <p className="text-sm">{style.text}</p>

        {/* Evidence */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Basis: {aqi.basis}</div>
          <div>
            PM2.5 AQI: {aqi.components.pm25_aqi} · PM10 AQI:{" "}
            {aqi.components.pm10_aqi}
          </div>
        </div>

        {/* Trust footer */}
        <div className="pt-2 text-xs italic text-muted-foreground">
          Interpretation aligned with WHO & CPCB particulate guidelines
        </div>
      </CardContent>
    </Card>
  );
};
