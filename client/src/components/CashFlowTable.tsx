import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface CashFlowItem {
  id: number;
  type: 'pemasukan' | 'pengeluaran';
  category: string;
  description: string;
  amount: number;
  transactionDate: string;
}

interface CashFlowTableProps {
  items?: CashFlowItem[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onFilterChange?: (filters: { type: string; search: string }) => void;
  onPageChange?: (page: number) => void;
}

export default function CashFlowTable({
  items = [],
  isLoading = false,
  pagination,
  onFilterChange,
  onPageChange,
}: CashFlowTableProps) {
  const [filters, setFilters] = useState({ type: "", search: "" });
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari transaksi..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter toggle (mobile) */}
          <Button
            type="button"
            variant="outline"
            className="sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </Button>

          {/* Filter tipe (desktop) */}
          <div className="hidden sm:block">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full sm:w-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
        </div>

        {/* Filter (mobile expanded) */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4 sm:hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Transaksi
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto responsive-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Tanggal</TableHead>
                <TableHead className="w-[100px]">Tipe</TableHead>
                <TableHead className="w-[150px]">Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right w-[180px]">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Tidak ada data transaksi
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.transactionDate), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.type === "pemasukan"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {item.type === "pemasukan" ? "Masuk" : "Keluar"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        item.type === "pemasukan" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {item.type === "pemasukan" ? "+" : "-"} {formatRupiah(item.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <p className="text-sm text-gray-500">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
            {pagination.total} transaksi
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Halaman {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
