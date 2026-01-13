import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SensorData,
  Device,
  Alert,
  Recommendation,
  generateSensorData,
  generateDemoExtremes,
  calculateHealthScore,
  generateRecommendations,
  generateDevices,
  generateAlerts,
  generateHistoricalData,
  HealthStatus,
} from '@/lib/mockData';

interface SensorContextType {
  sensorData: SensorData | null;
  healthScore: { score: number; status: HealthStatus } | null;
  devices: Device[];
  alerts: Alert[];
  recommendations: Recommendation[];
  historicalData: ReturnType<typeof generateHistoricalData>;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  lastUpdated: Date | null;
  selectedDevice: Device | null;
  selectDevice: (device: Device | null) => void;
  acknowledgeAlert: (alertId: string) => void;
  refreshData: () => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [healthScore, setHealthScore] = useState<{ score: number; status: HealthStatus } | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [historicalData, setHistoricalData] = useState<ReturnType<typeof generateHistoricalData>>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const refreshData = useCallback(() => {
    const newData = isDemoMode ? generateDemoExtremes() : generateSensorData('normal');
    setSensorData(newData);
    setHealthScore(calculateHealthScore(newData));
    setRecommendations(generateRecommendations(newData));
    setAlerts(generateAlerts(newData));
    setLastUpdated(new Date());
  }, [isDemoMode]);

  // Initialize data
  useEffect(() => {
    setDevices(generateDevices());
    setHistoricalData(generateHistoricalData(24));
    refreshData();
  }, []);

  // Refresh data when demo mode changes
  useEffect(() => {
    refreshData();
  }, [isDemoMode, refreshData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const selectDevice = (device: Device | null) => {
    setSelectedDevice(device);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  return (
    <SensorContext.Provider
      value={{
        sensorData,
        healthScore,
        devices,
        alerts,
        recommendations,
        historicalData,
        isDemoMode,
        toggleDemoMode,
        lastUpdated,
        selectedDevice,
        selectDevice,
        acknowledgeAlert,
        refreshData,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

export const useSensor = () => {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error('useSensor must be used within a SensorProvider');
  }
  return context;
};
