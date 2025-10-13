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

// import AdminPOList from "./pages/admin/AdminPOList";
// import AdminPOForm from "./pages/admin/AdminPOForm";
// import AdminPODetail from "./pages/admin/AdminPODetail";

//PO 
import POList from "@/pages/admin/POList";
import POForm from "@/pages/admin/POForm";
import PODetail from "@/pages/admin/PODetail";
import POInputPrice from "@/pages/admin/POInputPrice";
import POReview from "@/pages/admin/POReview";
import POApprove from "@/pages/admin/POApprove";

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
                {/* <Route path="/admin/po" element={<AdminPOList />} />
                <Route path="/admin/po/new" element={<AdminPOForm />} />
                <Route path="/admin/po/:id" element={<AdminPODetail />} /> */}
                <Route path="/admin/po" element={<POList />} />
                <Route path="/admin/po/new" element={<POForm />} />
                <Route path="/admin/po/:id" element={<PODetail />} />
                <Route path="/admin/po/:id/input-price" element={<POInputPrice />} />
                <Route path="/admin/po/:id/review" element={<POReview />} />
                <Route path="/admin/po/:id/approve" element={<POApprove />} />
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
