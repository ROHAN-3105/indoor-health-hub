import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SensorReading } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  name: string;
  reading: SensorReading;
  icon: LucideIcon;
  delay?: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'text-health-good border-health-good/30 bg-health-good/10';
    case 'moderate':
      return 'text-health-moderate border-health-moderate/30 bg-health-moderate/10';
    case 'poor':
      return 'text-health-poor border-health-poor/30 bg-health-poor/10';
    case 'hazardous':
      return 'text-health-hazardous border-health-hazardous/30 bg-health-hazardous/10';
    default:
      return 'text-muted-foreground border-border bg-muted';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3" />;
    case 'down':
      return <TrendingDown className="w-3 h-3" />;
    default:
      return <Minus className="w-3 h-3" />;
  }
};

export const SensorCard: React.FC<SensorCardProps> = ({ name, reading, icon: Icon, delay = 0 }) => {
  const statusColorClass = getStatusColor(reading.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-xl gradient-card p-4 border transition-all duration-300 cursor-pointer',
        statusColorClass
      )}
    >
      {/* Background glow */}
      <div
        className={cn(
          'absolute inset-0 opacity-10',
          reading.status === 'good' && 'bg-health-good',
          reading.status === 'moderate' && 'bg-health-moderate',
          reading.status === 'poor' && 'bg-health-poor',
          reading.status === 'hazardous' && 'bg-health-hazardous'
        )}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2 rounded-lg', statusColorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className={cn('flex items-center gap-1 text-xs', statusColorClass)}>
            {getTrendIcon(reading.trend)}
            <span className="capitalize">{reading.trend}</span>
          </div>
        </div>

        <div className="mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {name}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <motion.span
            key={reading.value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold font-display text-foreground"
          >
            {reading.value}
          </motion.span>
          <span className="text-sm text-muted-foreground">{reading.unit}</span>
        </div>

        <div className="mt-2">
          <span
            className={cn(
              'inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize',
              statusColorClass
            )}
          >
            {reading.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
