import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DokterDashboard from "./pages/dokter/DokterDashboard";
import KasirDashboard from "./pages/kasir/KasirDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pasien" element={<AdminDashboard />} />
            <Route path="/admin/dokter" element={<AdminDashboard />} />
            <Route path="/admin/antrian" element={<AdminDashboard />} />
            <Route path="/admin/laporan" element={<AdminDashboard />} />
            
            {/* Dokter Routes */}
            <Route path="/dokter" element={<DokterDashboard />} />
            <Route path="/dokter/antrian" element={<DokterDashboard />} />
            <Route path="/dokter/periksa" element={<DokterDashboard />} />
            <Route path="/dokter/riwayat" element={<DokterDashboard />} />
            
            {/* Kasir Routes */}
            <Route path="/kasir" element={<KasirDashboard />} />
            <Route path="/kasir/tagihan" element={<KasirDashboard />} />
            <Route path="/kasir/bayar" element={<KasirDashboard />} />
            <Route path="/kasir/riwayat" element={<KasirDashboard />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
