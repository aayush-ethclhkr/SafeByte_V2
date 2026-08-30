import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Tools from "./pages/Tools";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MalwareScanner from "./pages/MalwareScanner";
import VulnScanner from "./pages/VulnScanner";
import FraudScanner from "./pages/FraudScanner";
import CryptoTrace from "./pages/CryptoTrace";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

// Pages where Navbar/Footer/ChatBot should be hidden
const AUTH_ROUTES = ["/login", "/verify-otp", "/dashboard"];

function AppShell() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/"                      element={<Index />} />
        <Route path="/about"                 element={<About />} />
        <Route path="/services"              element={<Services />} />
        <Route path="/tools"                 element={<Tools />} />
        <Route path="/tools/malware-scanner" element={<MalwareScanner />} />
        <Route path="/tools/vuln-scanner"    element={<VulnScanner />} />
        <Route path="/tools/fraud-scanner"   element={<FraudScanner />} />
        <Route path="/tools/crypto-trace"    element={<CryptoTrace />} />
        <Route path="/contact"               element={<Contact />} />

        {/* Auth routes */}
        <Route path="/login"      element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <ChatBot />}
    </>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
