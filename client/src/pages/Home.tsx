import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import AboutSection from '@/components/AboutSection';
import CashFlowSummary from '@/components/CashFlowSummary';
import NewsSection from '@/components/NewsSection';
import DonationInfoSection from '@/components/DonationInfoSection';
import Footer from '@/components/Footer';
import { getCashFlowStatistics } from "@/services/cashflowApi";
import api from '@/services/api'; // ✅ axios instance yg sudah include baseURL & token

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const mockBankAccounts = [
  //   {
  //     bank: 'Bank Syariah Indonesia (BSI)',
  //     accountNumber: '7123456789',
  //     accountName: 'Masjid At-Taqwa',
  //   },
  //   {
  //     bank: 'Bank Mandiri Syariah',
  //     accountNumber: '1234567890',
  //     accountName: 'Yayasan Masjid At-Taqwa',
  //   },
  // ];
  // Fetch bank accounts
  const { data: bankAccountsData } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data } = await api.get("/bank-accounts");
      return data;
    },
  });

  // Format bank accounts for DonationInfoSection
  const bankAccounts = bankAccountsData?.map((account: any) => ({
    bank: account.bankName,
    accountNumber: account.accountNumber,
    accountName: account.accountHolder,
  })) || [];
  // Fetch cash flow statistics
    const { data: statsData } = useQuery({
      queryKey: ["cashflow-statistics"],
      queryFn: () => getCashFlowStatistics(),
    });
    const stats = statsData?.data;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await api.get('/news/public/list?limit=3');
        setNews(res.data.data || []); 
      } catch (err: any) {
        console.error('Gagal mengambil berita:', err);
        setError('Tidak dapat memuat berita terbaru');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <HeroBanner />
        <AboutSection />
        <CashFlowSummary
                  totalPemasukan={stats?.totalPemasukan || 0}
                  totalPengeluaran={stats?.totalPengeluaran || 0}
                  saldo={stats?.saldo || 0}
                />

        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat berita...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <NewsSection news={news} />
        )}

        <DonationInfoSection bankAccounts={bankAccounts} />
      </main>
      <Footer />
    </div>
  );
}
