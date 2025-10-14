import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

interface DonationInfoSectionProps {
  bankAccounts?: BankAccount[];
}

export default function DonationInfoSection({ 
  bankAccounts = [] 
}: DonationInfoSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isSingle = bankAccounts.length === 1; // ✅ kondisi jika hanya 1 rekening

  return (
    <section className="py-16 md:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
            Informasi Donasi
          </h2>
          <p className="text-lg text-muted-foreground">
            Mari berkontribusi untuk pembangunan Masjid At-Taqwa
          </p>
        </div>

        {/* ✅ jika hanya 1 rekening, jadikan center */}
        <div
          className={
            isSingle
              ? "flex justify-center max-w-4xl mx-auto"
              : "grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto"
          }
        >
          {bankAccounts.map((account, index) => (
            <Card key={index} className="border-2 w-full max-w-md" data-testid={`card-bank-${index}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  {account.bank}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nomor Rekening</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-2xl font-bold text-foreground" data-testid={`text-account-number-${index}`}>
                      {account.accountNumber}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(account.accountNumber, `account-${index}`)}
                      data-testid={`button-copy-account-${index}`}
                    >
                      {copiedId === `account-${index}` ? (
                        <Check className="h-4 w-4 text-chart-1" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Atas Nama</p>
                  <p className="text-lg font-semibold text-foreground" data-testid={`text-account-name-${index}`}>
                    {account.accountName}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Setiap donasi yang Anda berikan akan dicatat dan dilaporkan secara transparan. 
                Semua transaksi akan melalui proses verifikasi dan persetujuan sesuai prosedur.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
