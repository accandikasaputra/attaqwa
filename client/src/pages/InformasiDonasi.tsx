import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DonationInfoSection from '@/components/DonationInfoSection';
import CashFlowTable from '@/components/CashFlowTable';
import CashFlowSummary from '@/components/CashFlowSummary';

export default function InformasiDonasi() {
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

  const mockCashFlow = [
    {
      id: 1,
      type: 'pemasukan' as const,
      category: 'Donasi',
      description: 'Donasi dari Bapak Ahmad untuk pembangunan masjid',
      amount: 5000000,
      transactionDate: '2025-01-05',
    },
    {
      id: 2,
      type: 'pengeluaran' as const,
      category: 'Material',
      description: 'Pembelian semen dan pasir untuk tahap pondasi',
      amount: 15000000,
      transactionDate: '2025-01-04',
    },
    {
      id: 3,
      type: 'pemasukan' as const,
      category: 'Donasi',
      description: 'Donasi kolektif dari jamaah Jumat',
      amount: 8000000,
      transactionDate: '2025-01-03',
    },
    {
      id: 4,
      type: 'pengeluaran' as const,
      category: 'Tenaga Kerja',
      description: 'Upah tukang dan pekerja bulan Desember',
      amount: 25000000,
      transactionDate: '2024-12-31',
    },
    {
      id: 5,
      type: 'pemasukan' as const,
      category: 'Donasi',
      description: 'Transfer dari Ibu Siti',
      amount: 10000000,
      transactionDate: '2024-12-28',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Informasi Donasi</h1>
            <p className="text-lg text-primary-foreground/90">
              Transparansi pengelolaan dana pembangunan Masjid At-Taqwa
            </p>
          </div>
        </div>

        <CashFlowSummary
          totalPemasukan={250000000}
          totalPengeluaran={180000000}
          saldo={70000000}
        />

        <DonationInfoSection bankAccounts={mockBankAccounts} />

        <section className="py-16 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Riwayat Transaksi
              </h2>
              <p className="text-lg text-muted-foreground">
                Daftar lengkap pemasukan dan pengeluaran yang telah disetujui
              </p>
            </div>
            <CashFlowTable items={mockCashFlow} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
