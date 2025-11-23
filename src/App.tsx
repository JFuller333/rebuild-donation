import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import DonorDashboard from "./pages/DonorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TestReceipt from "./pages/TestReceipt";
import Diagnostics from "./pages/Diagnostics";
import OrderDiagnostics from "./pages/OrderDiagnostics";
import CheckMyDonations from "./pages/CheckMyDonations";
import ManualOrderProcess from "./pages/ManualOrderProcess";
import CreateMyDonation from "./pages/CreateMyDonation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/products/:id" element={<ProjectDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/test-receipt" element={<TestReceipt />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/order-diagnostics" element={<OrderDiagnostics />} />
          <Route path="/check-my-donations" element={<CheckMyDonations />} />
          <Route path="/manual-order-process" element={<ManualOrderProcess />} />
          <Route path="/create-my-donation" element={<CreateMyDonation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
