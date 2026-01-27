import { motion } from 'framer-motion';
import { SensorProvider } from '@/contexts/SensorContext';
import { Header } from '@/components/Header';
import { HealthScoreCard } from '@/components/HealthScoreCard';
import { SensorGrid } from '@/components/SensorGrid';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';
import { AlertsPanel } from '@/components/AlertsPanel';
import { DeviceStatus } from '@/components/DeviceStatus';
import { TrendChart } from '@/components/TrendChart';
import { DemoModeToggle } from '@/components/DemoModeToggle';
import { Disclaimer, FooterDisclaimer } from '@/components/Disclaimer';
import { HealthExplainer } from '@/components/HealthExplainer';

const DashboardContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Disclaimer />
        </motion.div>

        {/* Demo Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <DemoModeToggle />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Score */}
            <HealthScoreCard />

            {/* Sensor Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
                Live Sensor Readings
                <span className="w-2 h-2 bg-health-good rounded-full animate-pulse" />
              </h2>
              <SensorGrid />
            </motion.div>

            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TrendChart />
            </motion.div>

            {/* AI Health Explainer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <HealthExplainer />
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AlertsPanel />
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecommendationsPanel />
            </motion.div>

            {/* Device Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <DeviceStatus />
            </motion.div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <FooterDisclaimer />
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SensorProvider>
      <DashboardContent />
    </SensorProvider>
  );
};

export default Dashboard;
