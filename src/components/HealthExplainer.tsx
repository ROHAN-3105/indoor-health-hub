import { motion } from 'framer-motion';
import { useSensor } from '@/contexts/SensorContext';
import { cn } from '@/lib/utils';
import { Brain, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface FactorExplanation {
  parameter: string;
  impact: string;
  severity: 'good' | 'moderate' | 'poor' | 'hazardous';
}

export const HealthExplainer = () => {
  const { sensorData, healthScore } = useSensor();

  if (!sensorData || !healthScore) return null;

  const getExplanations = (): FactorExplanation[] => {
    const explanations: FactorExplanation[] = [];

    // CO2 explanation
    if (sensorData.co2.status !== 'good') {
      if (sensorData.co2.value > 1500) {
        explanations.push({
          parameter: 'CO₂',
          impact: 'Very high CO₂ levels can cause drowsiness, headaches, and reduced cognitive function.',
          severity: 'hazardous',
        });
      } else if (sensorData.co2.value > 1000) {
        explanations.push({
          parameter: 'CO₂',
          impact: 'Elevated CO₂ indicates poor ventilation. May cause mild discomfort.',
          severity: 'poor',
        });
      } else {
        explanations.push({
          parameter: 'CO₂',
          impact: 'CO₂ levels are slightly elevated. Consider improving air circulation.',
          severity: 'moderate',
        });
      }
    }

    // Humidity + Temperature combo (mold risk)
    if (sensorData.humidity.value > 60 && sensorData.temperature.value > 22) {
      explanations.push({
        parameter: 'Humidity + Temperature',
        impact: 'High humidity combined with warm temperature creates conditions favorable for mold growth.',
        severity: sensorData.humidity.value > 75 ? 'hazardous' : 'poor',
      });
    }

    // PM2.5 explanation
    if (sensorData.pm25.status !== 'good') {
      explanations.push({
        parameter: 'PM2.5',
        impact: `Fine particulate matter at ${sensorData.pm25.value} μg/m³ can affect respiratory health. Consider air purification.`,
        severity: sensorData.pm25.status as 'moderate' | 'poor' | 'hazardous',
      });
    }

    // VOC explanation
    if (sensorData.voc.status !== 'good') {
      explanations.push({
        parameter: 'VOCs',
        impact: 'Volatile organic compounds detected. May come from paints, cleaning products, or furniture.',
        severity: sensorData.voc.status as 'moderate' | 'poor' | 'hazardous',
      });
    }

    // Noise explanation
    if (sensorData.noise.status !== 'good') {
      explanations.push({
        parameter: 'Noise',
        impact: `Noise levels at ${sensorData.noise.value} dB may cause stress and affect concentration.`,
        severity: sensorData.noise.status as 'moderate' | 'poor' | 'hazardous',
      });
    }

    return explanations.slice(0, 3);
  };

  const explanations = getExplanations();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'hazardous':
      case 'poor':
        return <AlertCircle className="w-4 h-4" />;
      case 'moderate':
        return <Info className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'hazardous':
        return 'bg-health-hazardous/10 border-health-hazardous/30 text-health-hazardous';
      case 'poor':
        return 'bg-health-poor/10 border-health-poor/30 text-health-poor';
      case 'moderate':
        return 'bg-health-moderate/10 border-health-moderate/30 text-health-moderate';
      default:
        return 'bg-health-good/10 border-health-good/30 text-health-good';
    }
  };

  if (explanations.length === 0 && healthScore.status === 'good') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl gradient-card p-6 border border-border/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-health-good/20">
            <Brain className="w-5 h-5 text-health-good" />
          </div>
          <h3 className="text-lg font-semibold font-display">AI Health Analysis</h3>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-health-good/10 border border-health-good/30">
          <CheckCircle className="w-5 h-5 text-health-good shrink-0" />
          <p className="text-sm text-foreground">
            All environmental parameters are within healthy ranges. Your indoor environment is optimal!
          </p>
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
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold font-display">AI Health Analysis</h3>
          <p className="text-xs text-muted-foreground">Understanding your score</p>
        </div>
      </div>

      <div className="space-y-3">
        {explanations.map((exp, index) => (
          <motion.div
            key={exp.parameter}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-4 rounded-xl border',
              getSeverityStyles(exp.severity)
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('p-1.5 rounded-lg shrink-0', getSeverityStyles(exp.severity))}>
                {getSeverityIcon(exp.severity)}
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">{exp.parameter}</h4>
                <p className="text-sm text-muted-foreground">{exp.impact}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
        Analysis based on environmental guidelines. Not a medical diagnosis.
      </p>
    </motion.div>
  );
};
