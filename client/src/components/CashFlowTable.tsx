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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onFilterChange?: (filters: {
    type: string;
    search: string;
  }) => void;
  onPageChange?: (page: number) => void;
}

export default function CashFlowTable({ 
  items = [], 
  isLoading = false,
  pagination,
  onFilterChange,
  onPageChange,
}: CashFlowTableProps) {
  const [filters, setFilters] = useState({
    type: "",
    search: "",
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari transaksi..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.type ?? ""}
          onValueChange={(value) => handleFilterChange("type", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__Senua__">Semua Tipe</SelectItem>
            <SelectItem value="pemasukan">Pemasukan</SelectItem>
            <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Tidak ada data transaksi
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} data-testid={`row-cashflow-${item.id}`}>
                    <TableCell className="font-medium" data-testid={`date-${item.id}`}>
                      {format(new Date(item.transactionDate), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.type === 'pemasukan'
                            ? 'bg-chart-1/10 text-chart-1'
                            : 'bg-destructive/10 text-destructive'
                        }
                        data-testid={`badge-type-${item.id}`}
                      >
                        {item.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`category-${item.id}`}>{item.category}</TableCell>
                    <TableCell className="max-w-xs truncate" data-testid={`description-${item.id}`}>
                      {item.description}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        item.type === 'pemasukan' ? 'text-chart-1' : 'text-destructive'
                      }`}
                      data-testid={`amount-${item.id}`}
                    >
                      {item.type === 'pemasukan' ? '+' : '-'} {formatRupiah(item.amount)}
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
          <p className="text-sm text-muted-foreground">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} transaksi
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
            <div className="flex items-center gap-2 px-3">
              <span className="text-sm text-muted-foreground">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
            </div>
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