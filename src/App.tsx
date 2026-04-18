import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartSheetProvider } from "@/contexts/CartSheetContext";
import Index from "./pages/Index";
import IndexBrandHome from "./pages/IndexBrandHome";
import ProjectDetail from "./pages/ProjectDetail";
import ProductRouteTemplate from "./pages/ProductRouteTemplate";
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
import Contact from "./pages/Contact";
import SchoolPathways from "./pages/SchoolPathways";
import SchoolModules from "./pages/SchoolModules";
import SchoolLibrary from "./pages/SchoolLibrary";
import Shop from "./pages/Shop";
import FeaturedProjects from "./pages/FeaturedProjects";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartSheetProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/featured-projects" element={<FeaturedProjects />} />
          <Route path="/home-brand" element={<IndexBrandHome />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/products/:id" element={<ProductRouteTemplate />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/test-receipt" element={<TestReceipt />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/order-diagnostics" element={<OrderDiagnostics />} />
          <Route path="/check-my-donations" element={<CheckMyDonations />} />
          <Route path="/manual-order-process" element={<ManualOrderProcess />} />
          <Route path="/create-my-donation" element={<CreateMyDonation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/school/pathways" element={<SchoolPathways />} />
          <Route path="/school/pathways-to-equity-ownership" element={<SchoolPathways />} />
          <Route path="/school/modules" element={<SchoolModules />} />
          <Route path="/school/library" element={<SchoolLibrary />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </CartSheetProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
