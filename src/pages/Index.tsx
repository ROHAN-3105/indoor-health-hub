import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Wind,
  Thermometer,
  Volume2,
  Sun,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Building2,
  Home,
  School,
  Hospital,
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: 'Indoor Health Score',
      description: 'Single, easy-to-understand score based on all environmental parameters.',
    },
    {
      icon: Wind,
      title: 'Air Quality Monitoring',
      description: 'Track CO₂, PM2.5, PM10, and VOCs in real-time.',
    },
    {
      icon: Thermometer,
      title: 'Climate Analysis',
      description: 'Monitor temperature and humidity for optimal comfort.',
    },
    {
      icon: Volume2,
      title: 'Noise & Light Tracking',
      description: 'Ensure healthy noise levels and proper lighting conditions.',
    },
    {
      icon: Zap,
      title: 'AI-Powered Insights',
      description: 'Understand why your score changed with explainable AI.',
    },
    {
      icon: Shield,
      title: 'Preventive Recommendations',
      description: 'Get actionable advice to improve your indoor environment.',
    },
  ];

  const targetUsers = [
    { icon: Home, label: 'Homeowners' },
    { icon: Building2, label: 'Offices' },
    { icon: School, label: 'Schools & PGs' },
    { icon: Hospital, label: 'Hospitals' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-health-good/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display text-gradient-primary">
                Monacos
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow" onClick={() => navigate('/dashboard')}>
                Get Started
              </Button>
            </nav>
          </header>

          {/* Hero Content */}
          <div className="py-20 md:py-32 text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
                <Activity className="w-4 h-4" />
                Smart Environmental Monitoring
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 leading-tight"
            >
              Your Indoor Health,{' '}
              <span className="text-gradient-primary">Simplified</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Transform complex environmental data into a single, actionable Indoor Health Score. 
              Monitor air quality, climate, noise, and light with real-time insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground shadow-glow px-8 gap-2"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Learn More
              </Button>
            </motion.div>

            {/* Target Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 pt-8 border-t border-border/50"
            >
              <p className="text-sm text-muted-foreground mb-4">Designed for</p>
              <div className="flex flex-wrap justify-center gap-6">
                {targetUsers.map((user, index) => (
                  <div key={user.label} className="flex items-center gap-2 text-muted-foreground">
                    <user.icon className="w-5 h-5" />
                    <span className="text-sm">{user.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Comprehensive Indoor Monitoring
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our multi-sensor platform aggregates data from ESP32-based IoT devices 
              to provide a complete picture of your indoor environment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-12 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground mb-4">
                Start Monitoring Your Indoor Health Today
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Experience the power of real-time environmental monitoring with our demo mode. 
                No IoT devices required.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="px-8 gap-2"
                onClick={() => navigate('/dashboard')}
              >
                Try Demo Mode
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold font-display">Monacos</span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-lg">
              <strong>Disclaimer:</strong> This product provides environmental insights and is not a medical device. 
              Consult professionals for health concerns.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
