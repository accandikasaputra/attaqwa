import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { successResponse } from "../utils/response";

export const getCashFlowSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allTransactions = await storage.getAllTransactions();
    const approved = allTransactions.filter(t => t.status === 'approved');
    
    const totalPemasukan = approved
      .filter(t => t.type === 'pemasukan')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalPengeluaran = approved
      .filter(t => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const saldo = totalPemasukan - totalPengeluaran;

    return successResponse(res, {
      totalPemasukan,
      totalPengeluaran,
      saldo,
    }, "Summary cash flow");
  } catch (error) {
    next(error);
  }
};
