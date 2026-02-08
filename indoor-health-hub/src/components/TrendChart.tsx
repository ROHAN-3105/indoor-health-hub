import { motion } from 'framer-motion';
import { useSensor } from '@/contexts/SensorContext';
import {
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
  { key: 'score', label: 'Health Score', color: '#22D3EE' }, // Cyan
  { key: 'co2', label: 'CO₂', color: '#F472B6' },        // Pink
  { key: 'pm25', label: 'PM2.5', color: '#C084FC' },      // Purple
  { key: 'temperature', label: 'Temperature', color: '#60A5FA' }, // Blue
  { key: 'humidity', label: 'Humidity', color: '#34D399' },      // Green
];

export const TrendChart = () => {
  const { historicalData } = useSensor();
  const [selectedMetric, setSelectedMetric] = useState('score');

  const currentMetric = metrics.find((m) => m.key === selectedMetric) || metrics[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.5rem] bg-[var(--card)] p-6 border border-white/5 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-semibold font-display text-white">24-Hour Trends</h3>
          <p className="text-sm text-muted-foreground">Historical data visualization</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
                selectedMetric === metric.key
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              )}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historicalData}>
            <defs>
              <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentMetric.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={currentMetric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#ffffff40"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#ffffff40"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#252836',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                color: '#fff'
              }}
              labelStyle={{ color: '#aaa' }}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={currentMetric.color}
              strokeWidth={3}
              fill={`url(#gradient-${selectedMetric})`}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: currentMetric.color, boxShadow: `0 0 10px ${currentMetric.color}` }}
          />
          <span className="text-sm text-gray-400">{currentMetric.label}</span>
        </div>
        <span className="text-xs text-gray-500">
          Updated every 30 seconds
        </span>
      </div>
    </motion.div>
  );
};
