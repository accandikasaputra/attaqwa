import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DonationInfoSection from '@/components/DonationInfoSection';
import CashFlowTable from '@/components/CashFlowTable';
import CashFlowSummary from '@/components/CashFlowSummary';
import { getCashFlowStatistics, getCashFlowList } from "@/services/cashflowApi";
import api from "@/services/api";

export default function InformasiDonasi() {
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    page: 1,
    limit: 10,
  });

  // Fetch bank accounts
  const { data: bankAccountsData } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data } = await api.get("/bank-accounts");
      return data.data;
    },
  });

  // Fetch cash flow statistics
  const { data: statsData } = useQuery({
    queryKey: ["cashflow-statistics"],
    queryFn: () => getCashFlowStatistics(),
  });

  // Fetch cash flow list with filters (only approved)
  const { data: listData, isLoading } = useQuery({
    queryKey: ["cashflow-list", filters],
    queryFn: () => getCashFlowList({ ...filters, status: "approved" }),
  });

  const stats = statsData?.data;
  const transactions = listData?.data || [];
  const pagination = listData?.pagination;

  // Format bank accounts for DonationInfoSection
  const bankAccounts = bankAccountsData?.map((account: any) => ({
    bank: account.bankName,
    accountNumber: account.accountNumber,
    accountName: account.accountHolder,
  })) || [];

  const handleFilterChange = (newFilters: { type: string; search: string }) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

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
          totalPemasukan={stats?.totalPemasukan || 0}
          totalPengeluaran={stats?.totalPengeluaran || 0}
          saldo={stats?.saldo || 0}
        />

        <DonationInfoSection bankAccounts={bankAccounts} />

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
            <CashFlowTable 
              items={transactions}
              isLoading={isLoading}
              pagination={pagination}
              onFilterChange={handleFilterChange}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}