import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/malware-scanner" element={<MalwareScanner />} />
          <Route path="/tools/vuln-scanner" element={<VulnScanner />} />
          <Route path="/tools/fraud-scanner" element={<FraudScanner />} />
          <Route path="/tools/crypto-trace" element={<CryptoTrace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <ChatBot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
