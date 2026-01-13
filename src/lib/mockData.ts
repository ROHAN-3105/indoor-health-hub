// Mock sensor data generator for Monacos Indoor Health Platform

export type HealthStatus = 'good' | 'moderate' | 'poor' | 'hazardous';

export interface SensorReading {
  value: number;
  unit: string;
  status: HealthStatus;
  trend: 'up' | 'down' | 'stable';
}

export interface SensorData {
  temperature: SensorReading;
  humidity: SensorReading;
  co2: SensorReading;
  pm25: SensorReading;
  pm10: SensorReading;
  voc: SensorReading;
  noise: SensorReading;
  light: SensorReading;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastSync: Date;
  batteryLevel: number;
}

export interface Alert {
  id: string;
  type: HealthStatus;
  message: string;
  parameter: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  parameter: string;
}

// Helper function to determine status based on value and thresholds
const getStatus = (value: number, thresholds: { good: number; moderate: number; poor: number }): HealthStatus => {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.moderate) return 'moderate';
  if (value <= thresholds.poor) return 'poor';
  return 'hazardous';
};

const getHumidityStatus = (value: number): HealthStatus => {
  if (value >= 30 && value <= 50) return 'good';
  if (value >= 20 && value <= 60) return 'moderate';
  if (value >= 10 && value <= 70) return 'poor';
  return 'hazardous';
};

const getTemperatureStatus = (value: number): HealthStatus => {
  if (value >= 20 && value <= 24) return 'good';
  if (value >= 18 && value <= 26) return 'moderate';
  if (value >= 15 && value <= 30) return 'poor';
  return 'hazardous';
};

const getLightStatus = (value: number): HealthStatus => {
  if (value >= 300 && value <= 500) return 'good';
  if (value >= 200 && value <= 750) return 'moderate';
  if (value >= 100 && value <= 1000) return 'poor';
  return 'hazardous';
};

// Generate random sensor data with realistic values
export const generateSensorData = (mode: 'normal' | 'demo' = 'normal'): SensorData => {
  const multiplier = mode === 'demo' ? 1.5 : 1;
  
  const temp = 20 + Math.random() * 8 * multiplier;
  const humidity = 35 + Math.random() * 40 * multiplier;
  const co2 = 400 + Math.random() * 800 * multiplier;
  const pm25 = 5 + Math.random() * 50 * multiplier;
  const pm10 = 10 + Math.random() * 80 * multiplier;
  const voc = 50 + Math.random() * 400 * multiplier;
  const noise = 30 + Math.random() * 50 * multiplier;
  const light = 200 + Math.random() * 600;

  return {
    temperature: {
      value: Math.round(temp * 10) / 10,
      unit: '°C',
      status: getTemperatureStatus(temp),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    humidity: {
      value: Math.round(humidity),
      unit: '%',
      status: getHumidityStatus(humidity),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    co2: {
      value: Math.round(co2),
      unit: 'ppm',
      status: getStatus(co2, { good: 600, moderate: 1000, poor: 1500 }),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    pm25: {
      value: Math.round(pm25 * 10) / 10,
      unit: 'μg/m³',
      status: getStatus(pm25, { good: 12, moderate: 35, poor: 55 }),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    pm10: {
      value: Math.round(pm10 * 10) / 10,
      unit: 'μg/m³',
      status: getStatus(pm10, { good: 20, moderate: 50, poor: 100 }),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    voc: {
      value: Math.round(voc),
      unit: 'ppb',
      status: getStatus(voc, { good: 100, moderate: 300, poor: 500 }),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    noise: {
      value: Math.round(noise),
      unit: 'dB',
      status: getStatus(noise, { good: 40, moderate: 60, poor: 80 }),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    light: {
      value: Math.round(light),
      unit: 'lux',
      status: getLightStatus(light),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
  };
};

// Generate extreme conditions for demo mode
export const generateDemoExtremes = (): SensorData => {
  const scenarios = ['high_co2', 'poor_air', 'mold_risk', 'noise_pollution'];
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  const baseData = generateSensorData('normal');

  switch (scenario) {
    case 'high_co2':
      baseData.co2 = { value: 1800 + Math.random() * 500, unit: 'ppm', status: 'hazardous', trend: 'up' };
      baseData.temperature = { value: 26 + Math.random() * 3, unit: '°C', status: 'poor', trend: 'up' };
      break;
    case 'poor_air':
      baseData.pm25 = { value: 75 + Math.random() * 50, unit: 'μg/m³', status: 'hazardous', trend: 'up' };
      baseData.pm10 = { value: 120 + Math.random() * 80, unit: 'μg/m³', status: 'hazardous', trend: 'up' };
      baseData.voc = { value: 600 + Math.random() * 200, unit: 'ppb', status: 'hazardous', trend: 'up' };
      break;
    case 'mold_risk':
      baseData.humidity = { value: 78 + Math.random() * 15, unit: '%', status: 'hazardous', trend: 'up' };
      baseData.temperature = { value: 24 + Math.random() * 4, unit: '°C', status: 'moderate', trend: 'stable' };
      break;
    case 'noise_pollution':
      baseData.noise = { value: 85 + Math.random() * 15, unit: 'dB', status: 'hazardous', trend: 'up' };
      break;
  }

  return baseData;
};

// Calculate overall health score
export const calculateHealthScore = (data: SensorData): { score: number; status: HealthStatus } => {
  const weights = {
    co2: 0.2,
    pm25: 0.2,
    pm10: 0.1,
    voc: 0.15,
    temperature: 0.1,
    humidity: 0.1,
    noise: 0.1,
    light: 0.05,
  };

  const statusScores: Record<HealthStatus, number> = {
    good: 100,
    moderate: 70,
    poor: 40,
    hazardous: 15,
  };

  let weightedScore = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    const reading = data[key as keyof SensorData];
    weightedScore += statusScores[reading.status] * weight;
  });

  const score = Math.round(weightedScore);
  let status: HealthStatus;
  if (score >= 80) status = 'good';
  else if (score >= 60) status = 'moderate';
  else if (score >= 35) status = 'poor';
  else status = 'hazardous';

  return { score, status };
};

// Generate recommendations based on sensor data
export const generateRecommendations = (data: SensorData): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  if (data.co2.status !== 'good') {
    recommendations.push({
      id: 'co2-ventilate',
      title: 'Improve Ventilation',
      description: 'CO₂ levels are elevated. Open windows or increase air circulation to bring fresh air indoors.',
      priority: data.co2.status === 'hazardous' ? 'high' : 'medium',
      icon: 'Wind',
      parameter: 'CO₂',
    });
  }

  if (data.pm25.status !== 'good' || data.pm10.status !== 'good') {
    recommendations.push({
      id: 'air-purifier',
      title: 'Use Air Purifier',
      description: 'Particulate matter levels are high. Consider running an air purifier with HEPA filter.',
      priority: data.pm25.status === 'hazardous' ? 'high' : 'medium',
      icon: 'Filter',
      parameter: 'PM2.5/PM10',
    });
  }

  if (data.humidity.status !== 'good') {
    if (data.humidity.value > 60) {
      recommendations.push({
        id: 'reduce-humidity',
        title: 'Reduce Humidity',
        description: 'High humidity increases mold risk. Use a dehumidifier or improve ventilation.',
        priority: data.humidity.status === 'hazardous' ? 'high' : 'medium',
        icon: 'Droplets',
        parameter: 'Humidity',
      });
    } else {
      recommendations.push({
        id: 'increase-humidity',
        title: 'Increase Humidity',
        description: 'Low humidity can cause respiratory discomfort. Consider using a humidifier.',
        priority: 'low',
        icon: 'Droplets',
        parameter: 'Humidity',
      });
    }
  }

  if (data.noise.status !== 'good') {
    recommendations.push({
      id: 'reduce-noise',
      title: 'Reduce Noise Exposure',
      description: 'Noise levels are elevated. Consider noise-dampening solutions or relocating to a quieter area.',
      priority: data.noise.status === 'hazardous' ? 'high' : 'medium',
      icon: 'VolumeX',
      parameter: 'Noise',
    });
  }

  if (data.voc.status !== 'good') {
    recommendations.push({
      id: 'reduce-voc',
      title: 'Reduce Chemical Exposure',
      description: 'VOC levels are elevated. Remove chemical sources and increase ventilation.',
      priority: data.voc.status === 'hazardous' ? 'high' : 'medium',
      icon: 'FlaskConical',
      parameter: 'VOCs',
    });
  }

  if (data.light.status !== 'good') {
    recommendations.push({
      id: 'adjust-lighting',
      title: 'Adjust Lighting',
      description: data.light.value < 300 
        ? 'Light levels are low. Increase natural or artificial lighting for better visibility.'
        : 'Light levels are high. Consider reducing direct light exposure.',
      priority: 'low',
      icon: 'Sun',
      parameter: 'Light',
    });
  }

  return recommendations.slice(0, 4);
};

// Generate mock devices
export const generateDevices = (): Device[] => [
  {
    id: 'dev-001',
    name: 'Living Room Sensor',
    location: 'Living Room',
    status: 'online',
    lastSync: new Date(),
    batteryLevel: 87,
  },
  {
    id: 'dev-002',
    name: 'Bedroom Monitor',
    location: 'Master Bedroom',
    status: 'online',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    batteryLevel: 65,
  },
  {
    id: 'dev-003',
    name: 'Office Unit',
    location: 'Home Office',
    status: 'offline',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    batteryLevel: 12,
  },
];

// Generate mock alerts
export const generateAlerts = (data: SensorData): Alert[] => {
  const alerts: Alert[] = [];

  if (data.co2.status === 'hazardous' || data.co2.status === 'poor') {
    alerts.push({
      id: 'alert-co2',
      type: data.co2.status,
      message: `CO₂ levels at ${data.co2.value} ppm - ${data.co2.status === 'hazardous' ? 'Immediate ventilation required' : 'Consider improving ventilation'}`,
      parameter: 'CO₂',
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  if (data.pm25.status === 'hazardous' || data.pm25.status === 'poor') {
    alerts.push({
      id: 'alert-pm25',
      type: data.pm25.status,
      message: `PM2.5 at ${data.pm25.value} μg/m³ - Air quality is ${data.pm25.status}`,
      parameter: 'PM2.5',
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  if (data.humidity.status === 'hazardous') {
    alerts.push({
      id: 'alert-humidity',
      type: data.humidity.status,
      message: `Humidity at ${data.humidity.value}% - ${data.humidity.value > 60 ? 'Mold risk detected' : 'Air too dry'}`,
      parameter: 'Humidity',
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  if (data.noise.status === 'hazardous' || data.noise.status === 'poor') {
    alerts.push({
      id: 'alert-noise',
      type: data.noise.status,
      message: `Noise levels at ${data.noise.value} dB - Prolonged exposure may cause hearing damage`,
      parameter: 'Noise',
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  return alerts;
};

// Generate historical data for charts
export const generateHistoricalData = (hours: number = 24) => {
  const data = [];
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time,
      co2: 400 + Math.sin(i / 4) * 200 + Math.random() * 100,
      pm25: 10 + Math.sin(i / 6) * 15 + Math.random() * 10,
      temperature: 21 + Math.sin(i / 8) * 3 + Math.random() * 1,
      humidity: 45 + Math.sin(i / 5) * 15 + Math.random() * 5,
      noise: 35 + Math.sin(i / 3) * 20 + Math.random() * 10,
      score: 70 + Math.sin(i / 4) * 20 + Math.random() * 10,
    });
  }

  return data;
};
