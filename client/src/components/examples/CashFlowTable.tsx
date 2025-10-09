import CashFlowTable from '../CashFlowTable';

export default function CashFlowTableExample() {
  const mockItems = [
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
  ];

  return <CashFlowTable items={mockItems} />;
}
