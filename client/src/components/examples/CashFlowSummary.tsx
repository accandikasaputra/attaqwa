import CashFlowSummary from '../CashFlowSummary';

export default function CashFlowSummaryExample() {
  return (
    <CashFlowSummary
      totalPemasukan={250000000}
      totalPengeluaran={180000000}
      saldo={70000000}
    />
  );
}
