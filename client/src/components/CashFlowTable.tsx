import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
}

export default function CashFlowTable({ items = [] }: CashFlowTableProps) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
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
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Belum ada data transaksi
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
  );
}
