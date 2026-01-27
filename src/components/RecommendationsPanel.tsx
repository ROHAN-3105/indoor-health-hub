import { motion } from 'framer-motion';
import { useSensor } from '@/contexts/SensorContext';
import { cn } from '@/lib/utils';
import {
  Wind,
  Filter,
  Droplets,
  VolumeX,
  FlaskConical,
  Sun,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Wind,
  Filter,
  Droplets,
  VolumeX,
  FlaskConical,
  Sun,
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-health-hazardous/30 bg-health-hazardous/5';
    case 'medium':
      return 'border-health-moderate/30 bg-health-moderate/5';
    default:
      return 'border-border bg-card';
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-health-hazardous/20 text-health-hazardous';
    case 'medium':
      return 'bg-health-moderate/20 text-health-moderate';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const RecommendationsPanel = () => {
  const { recommendations } = useSensor();

  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl gradient-card p-6 border border-border/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-health-good/20">
            <Lightbulb className="w-5 h-5 text-health-good" />
          </div>
          <h3 className="text-lg font-semibold font-display">Recommendations</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-health-good/10 flex items-center justify-center">
            <Wind className="w-8 h-8 text-health-good" />
          </div>
          <p>All parameters are within healthy ranges!</p>
          <p className="text-sm mt-1">Keep maintaining this environment.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl gradient-card p-6 border border-border/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold font-display">Recommendations</h3>
        <span className="ml-auto text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
          {recommendations.length} suggestions
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const IconComponent = iconMap[rec.icon] || Lightbulb;
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-xl border transition-all duration-300 hover:translate-x-1 cursor-pointer group',
                getPriorityStyles(rec.priority)
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', getPriorityBadge(rec.priority))}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{rec.title}</h4>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', getPriorityBadge(rec.priority))}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <span className="text-xs text-muted-foreground/60 mt-1 inline-block">
                    Based on: {rec.parameter}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
