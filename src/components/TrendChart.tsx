import { motion } from 'framer-motion';
import { useSensor } from '@/contexts/SensorContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const metrics = [
  { key: 'score', label: 'Health Score', color: 'hsl(174, 72%, 46%)' },
  { key: 'co2', label: 'CO₂', color: 'hsl(45, 93%, 47%)' },
  { key: 'pm25', label: 'PM2.5', color: 'hsl(0, 72%, 51%)' },
  { key: 'temperature', label: 'Temperature', color: 'hsl(210, 100%, 50%)' },
  { key: 'humidity', label: 'Humidity', color: 'hsl(200, 100%, 50%)' },
];

export const TrendChart = () => {
  const { historicalData } = useSensor();
  const [selectedMetric, setSelectedMetric] = useState('score');

  const currentMetric = metrics.find((m) => m.key === selectedMetric) || metrics[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl gradient-card p-6 border border-border/50"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold font-display">24-Hour Trends</h3>
          <p className="text-sm text-muted-foreground">Historical data visualization</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                selectedMetric === metric.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historicalData}>
            <defs>
              <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentMetric.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={currentMetric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={currentMetric.color}
              strokeWidth={2}
              fill={`url(#gradient-${selectedMetric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentMetric.color }}
          />
          <span className="text-sm text-muted-foreground">{currentMetric.label}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Updated every 30 seconds
        </span>
      </div>
    </motion.div>
  );
};
