import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Favorites from "./pages/Favorites";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import About from "./pages/About";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import ManageRental from "./pages/ManageRental";
import TenantIncidents from "./pages/TenantIncidents";
import OwnerIncidents from "./pages/OwnerIncidents";
import ServiceBoard from "./pages/ServiceBoard";
import CookieBanner from "./components/CookieBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <FavoritesProvider>
            <Toaster />
            <Sonner />
            <CookieBanner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/account" element={<Account />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/manage-rental/:propertyId" element={<ManageRental />} />
              <Route path="/tenant-incidents" element={<TenantIncidents />} />
              <Route path="/owner-incidents" element={<OwnerIncidents />} />
              <Route path="/service-board" element={<ServiceBoard />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/r/:code" element={<ShortRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FavoritesProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;