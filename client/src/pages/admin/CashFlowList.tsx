import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
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
  CardDescription,
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
  
  const { data, isLoading } = useQuery({
    queryKey: ["cashflow-list", filters],
    queryFn: () => getCashFlowList(filters),
  });
  
  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination;
  
  // Calculate totals for current view
  const approvedTransactions = transactions.filter((t: any) => t.status === "approved");
  const viewTotalPemasukan = approvedTransactions
    .filter((t: any) => t.type === "pemasukan")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const viewTotalPengeluaran = approvedTransactions
    .filter((t: any) => t.type === "pengeluaran")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cash Flow</h1>
          <p className="text-gray-500">Daftar transaksi keuangan</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
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
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Selisih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (viewTotalPemasukan - viewTotalPengeluaran) >= 0 
                ? "text-blue-600" 
                : "text-red-600"
            }`}>
              Rp {(viewTotalPemasukan - viewTotalPengeluaran).toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              placeholder="Cari keterangan..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
            
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
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              />
              <Input
                type="date"
                placeholder="Sampai"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
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
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.transactionDate).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "pemasukan" ? "default" : "destructive"}>
                        {tx.type === "pemasukan" ? "Masuk" : "Keluar"}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {tx.category.replace("_", " ")}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[tx.status]?.variant}>
                        {statusMap[tx.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={tx.type === "pemasukan" ? "text-green-600" : "text-red-600"}>
                        {tx.type === "pemasukan" ? "+" : "-"} Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} transaksi
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
}