import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertBankAccountSchema } from "@shared/schema";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";

export const getActiveBankAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await storage.getActiveBankAccounts();
    return successResponse(res, accounts, "Daftar rekening bank aktif");
  } catch (error) {
    next(error);
  }
};

export const getAllBankAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await storage.getAllBankAccounts();
    return successResponse(res, accounts, "Daftar semua rekening bank");
  } catch (error) {
    next(error);
  }
};

export const createBankAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = insertBankAccountSchema.parse(req.body);
    const account = await storage.createBankAccount(validatedData);
    
    return successResponse(res, account, "Rekening bank berhasil dibuat", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Validation error", 400, error.errors);
    }
    next(error);
  }
};

