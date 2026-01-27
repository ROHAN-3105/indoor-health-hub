import { motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Disclaimer = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-muted/50 border border-border rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-primary/20 shrink-0">
          <Info className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Important: </span>
            This product provides environmental insights and is not a medical device. 
            Consult healthcare professionals for health concerns. Data shown is for 
            informational purposes only.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-lg hover:bg-muted transition-colors shrink-0"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
};

export const FooterDisclaimer = () => (
  <div className="text-center py-6 border-t border-border/50 mt-8">
    <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
      <strong>Disclaimer:</strong> Monacos provides environmental insights and is not a medical device. 
      The Indoor Health Score and recommendations are based on sensor data and general environmental guidelines. 
      Always consult healthcare professionals for medical concerns. Your data privacy is our priority.
    </p>
  </div>
);
