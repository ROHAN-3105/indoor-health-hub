import { motion } from 'framer-motion';
import { useSensor } from '@/contexts/SensorContext';
import { Switch } from '@/components/ui/switch';
import { FlaskConical, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DemoModeToggle = () => {
  const { isDemoMode, toggleDemoMode, refreshData } = useSensor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all duration-300',
        isDemoMode
          ? 'bg-primary/10 border-primary/30'
          : 'bg-muted/50 border-border'
      )}
    >
      <div className={cn(
        'p-2 rounded-lg transition-colors',
        isDemoMode ? 'bg-primary/20' : 'bg-muted'
      )}>
        <FlaskConical className={cn(
          'w-5 h-5 transition-colors',
          isDemoMode ? 'text-primary' : 'text-muted-foreground'
        )} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground">Demo Mode</h4>
          {isDemoMode && (
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full animate-pulse">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isDemoMode
            ? 'Simulating extreme indoor conditions'
            : 'Switch to simulate hazardous environments'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isDemoMode && (
          <button
            onClick={refreshData}
            className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
            title="Refresh simulation"
          >
            <Zap className="w-4 h-4 text-primary" />
          </button>
        )}
        <Switch
          checked={isDemoMode}
          onCheckedChange={toggleDemoMode}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </motion.div>
  );
};
