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


//PO 
import POList from "@/pages/admin/POList";
import POForm from "@/pages/admin/POForm";
import PODetail from "@/pages/admin/PODetail";
import POInputPrice from "@/pages/admin/POInputPrice";
import POReview from "@/pages/admin/POReview";
import POApprove from "@/pages/admin/POApprove";

import DonationList from "@/pages/admin/DonationList";
import DonationForm from "@/pages/admin/DonationForm";
import DonationDetail from "@/pages/admin/DonationDetail";
import DonationReview from "@/pages/admin/DonationReview";
import DonationApprove from "@/pages/admin/DonationApprove";

import AdminCashflowList from "@/pages/admin/AdminCashflowList";
// import AdminCashflowForm from "@/pages/admin/AdminCashflowForm";

import CashFlowDashboard from "@/pages/admin/CashFlowDashboard";
import CashFlowList from "@/pages/admin/CashFlowList";
import CashFlow from "@/pages/CashFlow";

import FeedbackList from "@/pages/admin/feedbackList";
import FeedbackDetail from "@/pages/admin/FeedbackDetail";
import FAQList from "@/pages/admin/FAQList";
import FAQForm from "@/pages/admin/FAQForm";
import FAQ from "@/pages/FAQ";


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
            <Route path="/informasi-donasi-test" element={<CashFlow />} />
            <Route path="/faqs" element={<FAQ />} />

            {/* Halaman login admin */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes (nested under /admin) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<CashFlowDashboard />} />
                <Route path="berita" element={<AdminBeritaList />} />
                <Route path="berita/new" element={<AdminBeritaForm />} />
                <Route path="berita/:id/edit" element={<AdminBeritaForm />} />
                
                <Route path="/admin/po" element={<POList />} />
                <Route path="/admin/po/new" element={<POForm />} />
                <Route path="/admin/po/:id" element={<PODetail />} />
                <Route path="/admin/po/:id/input-price" element={<POInputPrice />} />
                <Route path="/admin/po/:id/review" element={<POReview />} />
                <Route path="/admin/po/:id/approve" element={<POApprove />} />
                
                <Route path="donations" element={<DonationList />} />
                <Route path="donations/new" element={<DonationForm />} />
                <Route path="donations/:id" element={<DonationDetail />} />
                <Route path="donations/:id/edit" element={<DonationForm />} />
                <Route path="donations/:id/review" element={<DonationReview />} />
                <Route path="donations/:id/approve" element={<DonationApprove />} />

                {/* <Route path="cashflow/dashboard" element={<CashFlowDashboard />} /> */}
                <Route path="cashflow" element={<CashFlowList />} />

                <Route path="feedback" element={<FeedbackList />} />
                <Route path="feedback/:id" element={<FeedbackDetail />} />
                <Route path="faqs" element={<FAQList />} />
                <Route path="faqs/new" element={<FAQForm />} />
                <Route path="faqs/:id/edit" element={<FAQForm />} />

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
