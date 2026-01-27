import { motion } from 'framer-motion';
import { Activity, Bell, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSensor } from '@/contexts/SensorContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export const Header = () => {
  const { alerts, isDemoMode } = useSensor();
  const [menuOpen, setMenuOpen] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-gradient-primary">
                Monacos
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Indoor Health Intelligence
              </p>
            </div>
            {isDemoMode && (
              <span className="hidden md:inline-flex ml-3 text-xs px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
                Demo Mode
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="#devices" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Devices
            </a>
            <a href="#analytics" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Analytics
            </a>
            <a href="#settings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Settings
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-health-hazardous text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadAlerts}
                </span>
              )}
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Settings className="w-5 h-5" />
            </Button>

            {/* User */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <User className="w-5 h-5" />
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <div className="flex flex-col gap-3">
              <a href="#dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                Dashboard
              </a>
              <a href="#devices" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                Devices
              </a>
              <a href="#analytics" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                Analytics
              </a>
              <a href="#settings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                Settings
              </a>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};
