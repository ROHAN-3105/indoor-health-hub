import { motion } from 'framer-motion';
import { useSensor } from '@/contexts/SensorContext';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Battery, BatteryLow, MapPin, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DeviceStatus = () => {
  const { devices, selectedDevice, selectDevice } = useSensor();

  const onlineCount = devices.filter((d) => d.status === 'online').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl gradient-card p-6 border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Wifi className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-display">Devices</h3>
            <p className="text-xs text-muted-foreground">
              {onlineCount} of {devices.length} online
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Device
        </Button>
      </div>

      <div className="space-y-3">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => selectDevice(selectedDevice?.id === device.id ? null : device)}
            className={cn(
              'p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:border-primary/50',
              device.status === 'online' ? 'border-health-good/30 bg-health-good/5' : 'border-border bg-muted/20',
              selectedDevice?.id === device.id && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
          >
            <div className="flex items-center gap-3">
              {device.status === 'online' ? (
                <div className="relative">
                  <Wifi className="w-5 h-5 text-health-good" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-health-good rounded-full animate-pulse" />
                </div>
              ) : (
                <WifiOff className="w-5 h-5 text-muted-foreground" />
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{device.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{device.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs">
                  {device.batteryLevel <= 20 ? (
                    <BatteryLow className="w-4 h-4 text-health-hazardous" />
                  ) : (
                    <Battery className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={cn(
                    device.batteryLevel <= 20 ? 'text-health-hazardous' : 'text-muted-foreground'
                  )}>
                    {device.batteryLevel}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Last sync: {device.lastSync.toLocaleTimeString()}
              </span>
              {device.status === 'offline' && (
                <span className="ml-auto text-xs text-health-hazardous">
                  Device offline
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
