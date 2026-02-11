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

  // Use AQI from sensor data if available, otherwise fallback or 0
  const aqiValue = loading ? 0 : (aqi?.components?.pm25_aqi ?? 0);
  // Ideally we use latest?.aqi if we want the one from Arduino, 
  // but the existing code uses `useSensor().aqi` which comes from `/api/aqi` endpoint.
  // Since we updated `/api/aqi` to return the stored AQI, `aqi.components.pm25_aqi` 
  // is actually holding the main AQI value now (see backend change).

  const displayAQI = aqi?.components?.pm25_aqi ?? 0;
  const category = aqi?.category ?? "Loading...";
  const percentage = Math.min((displayAQI / 300) * 100, 100);

  return (
    <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-none text-white shadow-lg overflow-hidden relative min-h-[220px]">
      {/* Background Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <Wind className="w-5 h-5 text-white/80" /> Air Quality Index
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col justify-end h-[calc(100%-60px)]">
        <div className="flex items-end justify-between w-full">
          <div>
            <div className="text-5xl font-bold font-display tracking-tight text-white mb-2">
              {displayAQI}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-bold text-white backdrop-blur-sm">
                {category}
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
          <span>Score: {aqi?.aqi ?? "--"}</span>
        </div>
      </CardContent>
    </Card>
  );
};
