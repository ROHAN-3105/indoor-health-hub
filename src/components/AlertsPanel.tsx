import { motion, AnimatePresence } from 'framer-motion';
import { useSensor } from '@/contexts/SensorContext';
import { cn } from '@/lib/utils';
import { AlertTriangle, X, Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getAlertStyles = (type: string) => {
  switch (type) {
    case 'hazardous':
      return 'border-health-hazardous bg-health-hazardous/10';
    case 'poor':
      return 'border-health-poor bg-health-poor/10';
    case 'moderate':
      return 'border-health-moderate bg-health-moderate/10';
    default:
      return 'border-border bg-card';
  }
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'hazardous':
      return <AlertTriangle className="w-5 h-5 text-health-hazardous" />;
    case 'poor':
      return <AlertTriangle className="w-5 h-5 text-health-poor" />;
    case 'moderate':
      return <AlertTriangle className="w-5 h-5 text-health-moderate" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

export const AlertsPanel = () => {
  const { alerts, acknowledgeAlert } = useSensor();

  const activeAlerts = alerts.filter((alert) => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter((alert) => alert.acknowledged);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl gradient-card p-6 border border-border/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-health-hazardous/20">
          <Bell className="w-5 h-5 text-health-hazardous" />
        </div>
        <h3 className="text-lg font-semibold font-display">Alerts</h3>
        {activeAlerts.length > 0 && (
          <span className="ml-auto text-xs font-medium px-2 py-1 bg-health-hazardous/20 text-health-hazardous rounded-full animate-pulse">
            {activeAlerts.length} active
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-health-good/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-health-good" />
          </div>
          <p>No active alerts</p>
          <p className="text-sm mt-1">Your environment is healthy!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {activeAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-4 rounded-xl border transition-all duration-300',
                  getAlertStyles(alert.type)
                )}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{alert.parameter}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="shrink-0 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {acknowledgedAlerts.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">
                {acknowledgedAlerts.length} acknowledged alert(s)
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
