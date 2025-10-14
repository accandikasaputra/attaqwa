import api from "./api";

export interface CashFlowStatistics {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrend: {
    month: string;
    pemasukan: number;
    pengeluaran: number;
    net: number;
  }[];
  totalTransactions: number;
  pendingApprovals: number;
}

export interface CashFlowTransaction {
  id: number;
  type: "pemasukan" | "pengeluaran";
  category: string;
  description: string;
  amount: number;
  status: string;
  transactionDate: string;
  createdAt: string;
}

// Get statistics
export const getCashFlowStatistics = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const { data } = await api.get("/cashflow/statistics", { params });
  return data;
};

// Get cash flow list
export const getCashFlowList = async (params?: {
  type?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { data } = await api.get("/cashflow", { params });
  return data;
};