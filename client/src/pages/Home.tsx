import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import AboutSection from '@/components/AboutSection';
import CashFlowSummary from '@/components/CashFlowSummary';
import NewsSection from '@/components/NewsSection';
import DonationInfoSection from '@/components/DonationInfoSection';
import Footer from '@/components/Footer';
import communityImage1 from '@assets/stock_images/community_volunteeri_e559ab85.jpg';
import communityImage2 from '@assets/stock_images/community_volunteeri_f0aeb485.jpg';

export default function Home() {
  const mockNews = [
    {
      id: 1,
      title: 'Progres Pembangunan Mencapai 60%',
      excerpt: 'Alhamdulillah, pembangunan masjid At-Taqwa telah mencapai 60%. Tim pembangunan terus bekerja dengan baik.',
      category: 'update-pembangunan',
      publishedAt: '2025-01-05',
      image: communityImage1,
    },
    {
      id: 2,
      title: 'Pengajian Rutin Setiap Jumat Malam',
      excerpt: 'Mengundang seluruh jamaah untuk mengikuti pengajian rutin setiap Jumat malam bersama Ustadz Ahmad.',
      category: 'kegiatan',
      publishedAt: '2025-01-03',
      image: communityImage2,
    },
    {
      id: 3,
      title: 'Laporan Donasi Bulan Desember 2024',
      excerpt: 'Total donasi yang terkumpul di bulan Desember mencapai Rp 45.000.000. Terima kasih atas partisipasi jamaah.',
      category: 'pengumuman',
      publishedAt: '2025-01-01',
    },
  ];

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
        <NewsSection news={mockNews} />
        <DonationInfoSection bankAccounts={mockBankAccounts} />
      </main>
      <Footer />
    </div>
  );
}
