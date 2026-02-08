import { motion } from "framer-motion";

import { Header } from "@/components/Header";
import { HealthScoreCard } from "@/components/HealthScoreCard";
import { SensorGrid } from "@/components/SensorGrid";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { AlertsPanel } from "@/components/AlertsPanel";
import { DeviceStatus } from "@/components/DeviceStatus";
import { Disclaimer, FooterDisclaimer } from "@/components/Disclaimer";
import { HealthExplainer } from "@/components/HealthExplainer";
import { AQICard } from "@/components/AQICard";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* ================= DISCLAIMER ================= */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Disclaimer />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================= MAIN AREA ================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Health Score */}
            <HealthScoreCard />

            {/* AQI (Evidence-based, particulate only) */}
            <section className="fade-in-up delay-100">
              <AQICard />
            </section>

            {/* Live Sensor Readings */}
            <section className="fade-in-up delay-200">
              <h2 className="text-lg font-semibold mb-4">
                Live Environmental Readings
              </h2>
              <SensorGrid />
            </section>

            {/* Explainable Health Logic */}
            <section className="fade-in-up delay-300">
              <HealthExplainer />
            </section>
          </div>

          {/* ================= SIDEBAR ================= */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AlertsPanel />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecommendationsPanel />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <DeviceStatus />
            </motion.div>
          </div>
        </div>

        <FooterDisclaimer />
      </main>
    </div>
  );
};

export default Dashboard;
