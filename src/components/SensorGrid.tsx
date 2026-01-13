import { useSensor } from '@/contexts/SensorContext';
import { SensorCard } from './SensorCard';
import {
  Thermometer,
  Droplets,
  Wind,
  Cloud,
  Gauge,
  Volume2,
  Sun,
  FlaskConical,
} from 'lucide-react';

export const SensorGrid = () => {
  const { sensorData } = useSensor();

  if (!sensorData) return null;

  const sensors = [
    { name: 'Temperature', reading: sensorData.temperature, icon: Thermometer },
    { name: 'Humidity', reading: sensorData.humidity, icon: Droplets },
    { name: 'CO₂', reading: sensorData.co2, icon: Wind },
    { name: 'PM2.5', reading: sensorData.pm25, icon: Cloud },
    { name: 'PM10', reading: sensorData.pm10, icon: Gauge },
    { name: 'VOCs', reading: sensorData.voc, icon: FlaskConical },
    { name: 'Noise', reading: sensorData.noise, icon: Volume2 },
    { name: 'Light', reading: sensorData.light, icon: Sun },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {sensors.map((sensor, index) => (
        <SensorCard
          key={sensor.name}
          name={sensor.name}
          reading={sensor.reading}
          icon={sensor.icon}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
};
