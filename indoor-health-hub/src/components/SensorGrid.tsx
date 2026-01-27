import { SensorCard, sensorIcons } from "./SensorCard";
import { useSensor } from "@/contexts/SensorContext";

const getStatus = (
  value: number | null,
  goodMax: number,
  moderateMax: number
): "good" | "moderate" | "poor" => {
  if (value === null) return "moderate";
  if (value <= goodMax) return "good";
  if (value <= moderateMax) return "moderate";
  return "poor";
};

export const SensorGrid = () => {
  const { latest, loading } = useSensor();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-muted/20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Live Environmental Readings</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SensorCard
          title="Temperature"
          value={latest?.temperature ?? null}
          unit="°C"
          icon={sensorIcons.temperature}
          status={getStatus(latest?.temperature ?? null, 26, 30)}
          updatedAt={latest?.timestamp}
        />

        <SensorCard
          title="Humidity"
          value={latest?.humidity ?? null}
          unit="%"
          icon={sensorIcons.humidity}
          status={getStatus(latest?.humidity ?? null, 60, 75)}
          updatedAt={latest?.timestamp}
        />

        <SensorCard
          title="PM2.5"
          value={latest?.pm25 ?? null}
          unit="µg/m³"
          icon={sensorIcons.pm25}
          status={getStatus(latest?.pm25 ?? null, 35, 55)}
          updatedAt={latest?.timestamp}
        />

        <SensorCard
          title="Noise"
          value={latest?.noise ?? null}
          unit="dB"
          icon={sensorIcons.noise}
          status={getStatus(latest?.noise ?? null, 55, 70)}
          updatedAt={latest?.timestamp}
        />

        <SensorCard
          title="Light"
          value={latest?.light ?? null}
          unit="lux"
          icon={sensorIcons.light}
          status={getStatus(latest?.light ?? null, 300, 700)}
          updatedAt={latest?.timestamp}
        />
      </div>
    </section>
  );
};
