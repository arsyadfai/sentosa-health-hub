import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PasienPage from "./pages/admin/PasienPage";
import DokterPage from "./pages/admin/DokterPage";
import AntrianPage from "./pages/admin/AntrianPage";
import LaporanPage from "./pages/admin/LaporanPage";
import DokterDashboard from "./pages/dokter/DokterDashboard";
import AntrianDokterPage from "./pages/dokter/AntrianDokterPage";
import PeriksaPage from "./pages/dokter/PeriksaPage";
import RiwayatPage from "./pages/dokter/RiwayatPage";
import KasirDashboard from "./pages/kasir/KasirDashboard";
import TagihanPage from "./pages/kasir/TagihanPage";
import BayarPage from "./pages/kasir/BayarPage";
import RiwayatTransaksiPage from "./pages/kasir/RiwayatTransaksiPage";
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
            <Route path="/admin/pasien" element={<PasienPage />} />
            <Route path="/admin/dokter" element={<DokterPage />} />
            <Route path="/admin/antrian" element={<AntrianPage />} />
            <Route path="/admin/laporan" element={<LaporanPage />} />
            
            {/* Dokter Routes */}
            <Route path="/dokter" element={<DokterDashboard />} />
            <Route path="/dokter/antrian" element={<AntrianDokterPage />} />
            <Route path="/dokter/periksa" element={<PeriksaPage />} />
            <Route path="/dokter/riwayat" element={<RiwayatPage />} />
            
            {/* Kasir Routes */}
            <Route path="/kasir" element={<KasirDashboard />} />
            <Route path="/kasir/tagihan" element={<TagihanPage />} />
            <Route path="/kasir/bayar" element={<BayarPage />} />
            <Route path="/kasir/riwayat" element={<RiwayatTransaksiPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
