import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import CookieBanner from "@/components/CookieBanner";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Upgrade from "./pages/Upgrade";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SiteDetails from "./pages/SiteDetails";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import CGV from "./pages/CGV";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/sites/:id" element={<SiteDetails />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieBanner />
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
