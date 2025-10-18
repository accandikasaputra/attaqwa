import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";
import { paginate, getPaginationParams } from "../utils/pagination";

export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const transactions = await storage.getAllTransactions();
    
    
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

export const getTransactionsByStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.params;
    const { page, limit } = getPaginationParams(req.query);
    
    const transactions = await storage.getTransactionsByStatus(status);
    const result = paginate(transactions, page, limit);
    
    //return successResponse(res, result, `Transaksi dengan status ${status}`);
    return res.json({
      success: true,
      message: "Data berhasil diambil",
      result
    });

  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = insertTransactionSchema.parse(req.body);
    
    const transaction = await storage.createTransaction({
      ...validatedData,
      createdBy: req.user!.id,
    });

    return successResponse(res, transaction, "Transaksi berhasil dibuat", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Validation error", 400, error.errors);
    }
    next(error);
  }
};

export const approveBendahara = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const transaction = await storage.getTransactionById(id);
    
    if (!transaction) {
      return errorResponse(res, "Transaksi tidak ditemukan", 404);
    }

    if (transaction.status !== 'pending') {
      return errorResponse(res, "Status transaksi tidak valid untuk approval", 400);
    }

    await storage.updateTransactionStatus(id, 'approved_bendahara', req.user!.id);
    return successResponse(res, null, "Transaksi berhasil disetujui bendahara");
  } catch (error) {
    next(error);
  }
};

export const approveKetua = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const transaction = await storage.getTransactionById(id);
    
    if (!transaction) {
      return errorResponse(res, "Transaksi tidak ditemukan", 404);
    }

    if (transaction.status !== 'approved_bendahara') {
      return errorResponse(res, "Transaksi harus disetujui bendahara dulu", 400);
    }

    await storage.updateTransactionStatus(id, 'approved', req.user!.id);
    return successResponse(res, null, "Transaksi berhasil disetujui ketua");
  } catch (error) {
    next(error);
  }
};