import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface CashFlowSummaryProps {
  totalPemasukan?: number;
  totalPengeluaran?: number;
  saldo?: number;
}

export default function CashFlowSummary({
  totalPemasukan = 0,
  totalPengeluaran = 0,
  saldo = 0,
}: CashFlowSummaryProps) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section id="cash-flow-section" className="py-16 md:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
            Ringkasan Keuangan
          </h2>
          <p className="text-lg text-muted-foreground">
            Transparansi pengelolaan dana pembangunan masjid
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 hover-elevate" data-testid="card-pemasukan">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pemasukan
              </CardTitle>
              <div className="h-10 w-10 rounded-md bg-chart-1/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-chart-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-1" data-testid="text-pemasukan">
                {formatRupiah(totalPemasukan)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Donasi dari jamaah
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover-elevate" data-testid="card-pengeluaran">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pengeluaran
              </CardTitle>
              <div className="h-10 w-10 rounded-md bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive" data-testid="text-pengeluaran">
                {formatRupiah(totalPengeluaran)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Biaya pembangunan
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover-elevate" data-testid="card-saldo">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo Saat Ini
              </CardTitle>
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary" data-testid="text-saldo">
                {formatRupiah(saldo)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dana yang tersedia
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
