import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { successResponse } from "../utils/response";
import { paginate, getPaginationParams } from "../utils/pagination";

export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    let transactions = await storage.getAllTransactions();
    
    if (startDate && endDate) {
      transactions = transactions.filter(t => {
        const txDate = new Date(t.transactionDate);
        return txDate >= new Date(startDate as string) && 
              txDate <= new Date(endDate as string);
      });
    }
    
    const approved = transactions.filter(t => t.status === 'approved');
    
    const totalPemasukan = approved
      .filter(t => t.type === 'pemasukan')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalPengeluaran = approved
      .filter(t => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const saldo = totalPemasukan - totalPengeluaran;
    
    const categoryBreakdown: Record<string, number> = {};
    approved
      .filter(t => t.type === 'pengeluaran')
      .forEach(t => {
        if (!categoryBreakdown[t.category]) {
          categoryBreakdown[t.category] = 0;
        }
        categoryBreakdown[t.category] += Number(t.amount);
      });
    
    const monthlyTrend: any[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTransactions = approved.filter(t => {
        const txDate = new Date(t.transactionDate);
        return txDate >= month && txDate <= monthEnd;
      });
      
      const pemasukan = monthTransactions
        .filter(t => t.type === 'pemasukan')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const pengeluaran = monthTransactions
        .filter(t => t.type === 'pengeluaran')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      monthlyTrend.push({
        month: month.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        pemasukan,
        pengeluaran,
        net: pemasukan - pengeluaran,
      });
    }
    
    return successResponse(res, {
      totalPemasukan,
      totalPengeluaran,
      saldo,
      categoryBreakdown,
      monthlyTrend,
      totalTransactions: approved.length,
      pendingApprovals: transactions.filter(t => 
        t.status === 'pending' || 
        t.status === 'approved_bendahara'
      ).length,
    }, "Statistik cash flow");
  } catch (error) {
    next(error);
  }
};

export const getCashFlowList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      type, 
      category, 
      status, 
      startDate, 
      endDate, 
      search,
    } = req.query;
    
    const { page, limit } = getPaginationParams(req.query);
    
    let transactions = await storage.getAllTransactions();
    
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }
    if (startDate && endDate) {
      transactions = transactions.filter(t => {
        const txDate = new Date(t.transactionDate);
        return txDate >= new Date(startDate as string) && 
              txDate <= new Date(endDate as string);
      });
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      transactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }
    
    const { data, pagination } = paginate(transactions, page, limit);
    return res.json({
      success: true,
      message: "Data berhasil diambil",
      data,
      pagination
    });
  } catch (error) {
    next(error);
  }
};