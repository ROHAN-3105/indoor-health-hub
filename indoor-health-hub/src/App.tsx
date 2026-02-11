import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import DeviceDetails from "@/pages/DeviceDetails";

import { SensorProvider } from "@/contexts/SensorContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

/* Pages */
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Devices from "@/pages/Devices";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />


        {/* ✅ SensorProvider MUST wrap Router */}
        <AuthProvider>

          <SensorProvider>
            <BrowserRouter>

              <Routes>
                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Landing */}
                <Route path="/" element={<Index />} />

                {/* Core App */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/devices/:id" element={<DeviceDetails />} />
                <Route path="/settings" element={<Settings />} />


                {/* Future-ready */}
                {/* <Route path="/devices/:id" element={<DeviceDetails />} /> */}

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SensorProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
