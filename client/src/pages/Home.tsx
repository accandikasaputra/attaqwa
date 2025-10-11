import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import AboutSection from '@/components/AboutSection';
import CashFlowSummary from '@/components/CashFlowSummary';
import NewsSection from '@/components/NewsSection';
import DonationInfoSection from '@/components/DonationInfoSection';
import Footer from '@/components/Footer';
import api from '@/services/api'; // ✅ axios instance yg sudah include baseURL & token

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mockBankAccounts = [
    {
      bank: 'Bank Syariah Indonesia (BSI)',
      accountNumber: '7123456789',
      accountName: 'Masjid At-Taqwa',
    },
    {
      bank: 'Bank Mandiri Syariah',
      accountNumber: '1234567890',
      accountName: 'Yayasan Masjid At-Taqwa',
    },
  ];

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
          totalPemasukan={250000000}
          totalPengeluaran={180000000}
          saldo={70000000}
        />

        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat berita...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <NewsSection news={news} />
        )}

        <DonationInfoSection bankAccounts={mockBankAccounts} />
      </main>
      <Footer />
    </div>
  );
}
