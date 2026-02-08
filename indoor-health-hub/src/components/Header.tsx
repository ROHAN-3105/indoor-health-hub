import { motion } from "framer-motion";
import { Activity, Bell, Settings, User, Menu, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSensor } from "@/contexts/SensorContext";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { alerts } = useSensor();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const unreadAlerts = alerts.length;

  const baseLink =
    "text-sm font-medium transition-colors";
  const activeLink = "text-primary";
  const inactiveLink = "text-muted-foreground hover:text-primary";

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(baseLink, isActive ? activeLink : inactiveLink);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
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
              <h1 className="text-xl font-bold font-display text-gradient">
                Monacos
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Indoor Health Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/devices" className={navClass}>
              Devices
            </NavLink>
            <NavLink to="/analytics" className={navClass}>
              Analytics
            </NavLink>
            <NavLink to="/settings" className={navClass}>
              Settings
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/dashboard')}>
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-health-hazardous text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadAlerts}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5" />
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden sm:block">
                  {user.username}
                </span>
                <Button variant="ghost" size="icon" onClick={() => {
                  logout();
                  navigate('/login');
                }} title="Logout">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => navigate('/login')} title="Login">
                <LogIn className="w-5 h-5" />
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <div className="flex flex-col gap-3">
              <NavLink
                to="/dashboard"
                className={inactiveLink}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/devices"
                className={inactiveLink}
                onClick={() => setMenuOpen(false)}
              >
                Devices
              </NavLink>
              <NavLink
                to="/analytics"
                className={inactiveLink}
                onClick={() => setMenuOpen(false)}
              >
                Analytics
              </NavLink>
              <NavLink
                to="/settings"
                className={inactiveLink}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </NavLink>
              <div className="border-t border-border/50 pt-2 mt-2">
                {user ? (
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {
                    logout();
                    navigate('/login');
                    setMenuOpen(false);
                  }}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout ({user.username})
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {
                    navigate('/login');
                    setMenuOpen(false);
                  }}>
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </Button>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

