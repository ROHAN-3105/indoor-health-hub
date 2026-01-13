import { motion } from 'framer-motion';
import { useSensor } from '@/contexts/SensorContext';
import { cn } from '@/lib/utils';
import { Activity, TrendingUp, Clock } from 'lucide-react';

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'good':
      return {
        label: 'Good',
        className: 'bg-health-good',
        textClass: 'health-good',
        description: 'Air quality is excellent. No action needed.',
      };
    case 'moderate':
      return {
        label: 'Moderate',
        className: 'bg-health-moderate',
        textClass: 'health-moderate',
        description: 'Some parameters need attention.',
      };
    case 'poor':
      return {
        label: 'Poor',
        className: 'bg-health-poor',
        textClass: 'health-poor',
        description: 'Environment quality is degraded. Take action.',
      };
    case 'hazardous':
      return {
        label: 'Hazardous',
        className: 'bg-health-hazardous',
        textClass: 'health-hazardous',
        description: 'Immediate action required!',
      };
    default:
      return {
        label: 'Unknown',
        className: 'bg-muted',
        textClass: 'text-muted-foreground',
        description: 'Unable to calculate score.',
      };
  }
};

export const HealthScoreCard = () => {
  const { healthScore, lastUpdated, isDemoMode } = useSensor();

  if (!healthScore) return null;

  const config = getStatusConfig(healthScore.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl gradient-card p-6 border border-border/50"
    >
      {/* Demo mode indicator */}
      {isDemoMode && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-primary/20 rounded-full text-xs font-medium text-primary border border-primary/30">
          Demo Mode
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-muted-foreground mb-1">Indoor Health Score</h2>
          <p className="text-sm text-muted-foreground/60">{config.description}</p>
        </div>
        <Activity className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-8 mb-6">
        {/* Score Circle */}
        <motion.div
          className={cn(
            'relative w-32 h-32 rounded-full flex items-center justify-center',
            config.className
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
            <div className="text-center">
              <motion.span
                key={healthScore.score}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold font-display text-foreground"
              >
                {healthScore.score}
              </motion.span>
              <span className="block text-sm text-muted-foreground">/100</span>
            </div>
          </div>
        </motion.div>

        {/* Status Info */}
        <div className="flex-1">
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3', config.className)}>
            <span className="text-sm font-semibold text-white">{config.label}</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Score trending stable over 24h</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score Breakdown Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Hazardous</span>
          <span>Poor</span>
          <span>Moderate</span>
          <span>Good</span>
        </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-health-hazardous via-health-poor via-health-moderate to-health-good relative">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-background"
            initial={{ left: '0%' }}
            animate={{ left: `${healthScore.score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </div>
      </div>
    </motion.div>
  );
};
