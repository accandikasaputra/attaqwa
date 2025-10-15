import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
<<<<<<< HEAD
=======
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
>>>>>>> origin/development
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
<<<<<<< HEAD
=======
  CardDescription,
>>>>>>> origin/development
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCashFlowList } from "@/services/cashflowApi";

const statusMap: Record<string, { label: string; variant: any }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Pending", variant: "default" },
  approved_bendahara: { label: "Approved Bendahara", variant: "default" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function CashFlowList() {
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    status: "",
    search: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20,
  });
<<<<<<< HEAD

=======
  
>>>>>>> origin/development
  const { data, isLoading } = useQuery({
    queryKey: ["cashflow-list", filters],
    queryFn: () => getCashFlowList(filters),
  });
<<<<<<< HEAD

  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination;

=======
  
  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination;
  
  // Calculate totals for current view
>>>>>>> origin/development
  const approvedTransactions = transactions.filter((t: any) => t.status === "approved");
  const viewTotalPemasukan = approvedTransactions
    .filter((t: any) => t.type === "pemasukan")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const viewTotalPengeluaran = approvedTransactions
    .filter((t: any) => t.type === "pengeluaran")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
<<<<<<< HEAD

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
=======
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
>>>>>>> origin/development
        <div>
          <h1 className="text-3xl font-bold">Cash Flow</h1>
          <p className="text-gray-500">Daftar transaksi keuangan</p>
        </div>
<<<<<<< HEAD
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
=======
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
>>>>>>> origin/development
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {viewTotalPemasukan.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
<<<<<<< HEAD

=======
        
>>>>>>> origin/development
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {viewTotalPengeluaran.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
<<<<<<< HEAD

=======
        
>>>>>>> origin/development
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Selisih</CardTitle>
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div
              className={`text-2xl font-bold ${
                viewTotalPemasukan - viewTotalPengeluaran >= 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
=======
            <div className={`text-2xl font-bold ${
              (viewTotalPemasukan - viewTotalPengeluaran) >= 0 
                ? "text-blue-600" 
                : "text-red-600"
            }`}>
>>>>>>> origin/development
              Rp {(viewTotalPemasukan - viewTotalPengeluaran).toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>
<<<<<<< HEAD

=======
      
>>>>>>> origin/development
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
=======
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
>>>>>>> origin/development
            <Input
              placeholder="Cari keterangan..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
<<<<<<< HEAD

            {/* Type */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Date Range */}
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                type="date"
=======
            
            <Select
              value={filters.type ?? ""}
              onValueChange={(value) => setFilters({ ...filters, type: value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__semua__">Semua Tipe</SelectItem>
                <SelectItem value="pemasukan">Pemasukan</SelectItem>
                <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.status ?? ""}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__Semua__">Semua Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Dari"
>>>>>>> origin/development
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              />
              <Input
                type="date"
<<<<<<< HEAD
=======
                placeholder="Sampai"
>>>>>>> origin/development
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
<<<<<<< HEAD

      {/* Table */}
      <Card className="overflow-x-auto">
=======
      
      {/* Table */}
      <Card>
>>>>>>> origin/development
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
<<<<<<< HEAD
                  <TableCell colSpan={6} className="text-center py-6">
=======
                  <TableCell colSpan={6} className="text-center">
>>>>>>> origin/development
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
<<<<<<< HEAD
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
=======
                  <TableCell colSpan={6} className="text-center">
>>>>>>> origin/development
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
<<<<<<< HEAD
                    <TableCell>{new Date(tx.transactionDate).toLocaleDateString("id-ID")}</TableCell>
=======
                    <TableCell>
                      {new Date(tx.transactionDate).toLocaleDateString("id-ID")}
                    </TableCell>
>>>>>>> origin/development
                    <TableCell>
                      <Badge variant={tx.type === "pemasukan" ? "default" : "destructive"}>
                        {tx.type === "pemasukan" ? "Masuk" : "Keluar"}
                      </Badge>
                    </TableCell>
<<<<<<< HEAD
                    <TableCell className="capitalize">{tx.category.replace("_", " ")}</TableCell>
                    <TableCell className="max-w-md truncate">{tx.description}</TableCell>
=======
                    <TableCell className="capitalize">
                      {tx.category.replace("_", " ")}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {tx.description}
                    </TableCell>
>>>>>>> origin/development
                    <TableCell>
                      <Badge variant={statusMap[tx.status]?.variant}>
                        {statusMap[tx.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
<<<<<<< HEAD
                      <span
                        className={tx.type === "pemasukan" ? "text-green-600" : "text-red-600"}
                      >
                        {tx.type === "pemasukan" ? "+" : "-"} Rp{" "}
                        {Number(tx.amount).toLocaleString("id-ID")}
=======
                      <span className={tx.type === "pemasukan" ? "text-green-600" : "text-red-600"}>
                        {tx.type === "pemasukan" ? "+" : "-"} Rp {Number(tx.amount).toLocaleString("id-ID")}
>>>>>>> origin/development
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
<<<<<<< HEAD

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
                {pagination.total} transaksi
=======
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} transaksi
>>>>>>> origin/development
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/development
