import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSensor } from "@/contexts/SensorContext";
import { Wind } from "lucide-react";

export const AQICard = () => {
  const { aqi, loading } = useSensor();

  if (loading || !aqi) {
    return (
      <Card className="glass-card h-full flex items-center justify-center p-6">
        <span className="text-muted-foreground animate-pulse">Loading AQI...</span>
      </Card>
    );
  }

  // Calculate percentage for progress bar (max 100 for display scaling)
  const pm25 = aqi.components.pm25_aqi;
  const percentage = Math.min((pm25 / 200) * 100, 100);

  return (
    <Card className="bg-gradient-cyan border-none text-white shadow-lg overflow-hidden relative min-h-[220px]">
      {/* Background Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <Wind className="w-5 h-5 text-white/80" /> Air Quality Index (PM2.5)
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col justify-end h-[calc(100%-60px)]">
        <div className="flex items-end justify-between w-full">
          <div>
            <div className="text-5xl font-bold font-display tracking-tight text-white mb-2">
              {pm25}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-bold text-white backdrop-blur-sm">
                {aqi.category}
              </span>
              <span className="text-sm text-white/80">AQI</span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="h-2 w-32 bg-black/20 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-white/70 mt-2">Target: &lt; 50</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/60 flex justify-between">
          <span>PM10: {aqi.components.pm10_aqi}</span>
          <span>NO2: {aqi.components.no2_aqi}</span>
        </div>
      </CardContent>
    </Card>
  );
};
