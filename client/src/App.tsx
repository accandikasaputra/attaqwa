import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public pages
import Home from "@/pages/Home";
import Berita from "@/pages/Berita";
import InformasiDonasi from "@/pages/InformasiDonasi";
import Saran from "@/pages/Saran";
import NotFound from "@/pages/not-found";

import AdminLogin from "@/pages/admin/AdminLogin";
import ProtectedRoute from "@/components/ProtectedRoute";


// Admin pages
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBeritaList from "@/pages/admin/NewsList";
import AdminBeritaForm from "@/pages/admin/NewsForm";


import AdminCashflowList from "@/pages/admin/AdminCashflowList";
// import AdminCashflowForm from "@/pages/admin/AdminCashflowForm";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/berita" element={<Berita />} />
            <Route path="/informasi-donasi" element={<InformasiDonasi />} />
            <Route path="/saran" element={<Saran />} />
            <Route path="*" element={<NotFound />} />

            {/* Halaman login admin */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes (nested under /admin) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="berita" element={<AdminBeritaList />} />
                <Route path="berita/new" element={<AdminBeritaForm />} />
                <Route path="berita/:id/edit" element={<AdminBeritaForm />} />
                <Route path="donasi" element={<AdminCashflowList />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
