import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
} from "lucide-react";
import { getCashFlowStatistics, getCashFlowList } from "@/services/cashflowApi";

export default function CashFlow() {
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    page: 1,
    limit: 10,
  });
  
  // Get statistics
  const { data: statsData } = useQuery({
    queryKey: ["public-cashflow-statistics"],
    queryFn: () => getCashFlowStatistics(),
  });
  
  // Get approved transactions only for public view
  const { data: listData, isLoading } = useQuery({
    queryKey: ["public-cashflow-list", filters],
    queryFn: () => getCashFlowList({ ...filters, status: "approved" }),
  });
  
  const stats = statsData?.data;
  const transactions = listData?.data?.transactions || [];
  const pagination = listData?.data?.pagination;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Laporan Keuangan</h1>
          <p className="text-gray-600 text-lg">
            Transparansi pengelolaan dana pembangunan Masjid Al-Ikhlas
          </p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
              <ArrowUpCircle className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rp {stats?.totalPemasukan.toLocaleString("id-ID") || "0"}
              </div>
              <p className="text-xs text-green-100 mt-1">
                Dari donasi dan iuran warga
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <ArrowDownCircle className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rp {stats?.totalPengeluaran.toLocaleString("id-ID") || "0"}
              </div>
              <p className="text-xs text-red-100 mt-1">
                Untuk material dan operasional
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <Wallet className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rp {stats?.saldo.toLocaleString("id-ID") || "0"}
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Dana tersedia untuk pembangunan
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progress Keuangan</CardTitle>
            <CardDescription>
              Perbandingan pemasukan dan pengeluaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Pemasukan</span>
                  <span className="text-sm text-gray-500">
                    {stats?.totalPemasukan > 0 ? "100%" : "0%"}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Pengeluaran</span>
                  <span className="text-sm text-gray-500">
                    {stats?.totalPemasukan > 0 
                      ? `${((stats?.totalPengeluaran / stats?.totalPemasukan) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all"
                    style={{ 
                      width: stats?.totalPemasukan > 0 
                        ? `${(stats?.totalPengeluaran / stats?.totalPemasukan) * 100}%`
                        : "0%"
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Saldo</span>
                  <span className="text-sm text-gray-500">
                    {stats?.totalPemasukan > 0 
                      ? `${((stats?.saldo / stats?.totalPemasukan) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ 
                      width: stats?.totalPemasukan > 0 
                        ? `${(stats?.saldo / stats?.totalPemasukan) * 100}%`
                        : "0%"
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>
              Daftar transaksi keuangan yang telah disetujui
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari transaksi..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filters.type ?? ""}
                onValueChange={(value) => setFilters({ ...filters, type: value, page: 1 })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__Semua__">Semua Tipe</SelectItem>
                  <SelectItem value="pemasukan">Pemasukan</SelectItem>
                  <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Transaction List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada transaksi
                </div>
              ) : (
                transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-full ${
                        tx.type === "pemasukan" 
                          ? "bg-green-100" 
                          : "bg-red-100"
                      }`}>
                        {tx.type === "pemasukan" ? (
                          <TrendingUp className={`h-5 w-5 ${
                            tx.type === "pemasukan" 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`} />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{tx.description}</p>
                          <Badge 
                            variant={tx.type === "pemasukan" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {tx.type === "pemasukan" ? "Masuk" : "Keluar"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(tx.transactionDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}</span>
                          <span className="capitalize">
                            {tx.category.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        tx.type === "pemasukan" 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {tx.type === "pemasukan" ? "+" : "-"} Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Transparency Statement */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Komitmen Transparansi</h3>
                <p className="text-gray-700">
                  Kami berkomitmen untuk mengelola dana pembangunan masjid dengan transparan 
                  dan akuntabel. Setiap transaksi tercatat dan dapat dipantau oleh seluruh jamaah.
                  Semua data keuangan yang ditampilkan adalah data real-time yang telah diverifikasi 
                  dan disetujui oleh pengurus masjid.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}