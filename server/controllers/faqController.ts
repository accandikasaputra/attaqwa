import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertFAQSchema } from "@shared/schema";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";
import { paginate, getPaginationParams } from "../utils/pagination";

export const getActiveFAQs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await storage.getActiveFAQs();
    return successResponse(res, faqs, "Daftar FAQ");
  } catch (error) {
    next(error);
  }
};

export const getAllFAQs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search } = req.query;
    const { page, limit } = getPaginationParams(req.query);
    
    let faqsList = await storage.getAllFAQs();
    
    if (category) {
      faqsList = faqsList.filter(f => f.category === category);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      faqsList = faqsList.filter(f =>
        f.question.toLowerCase().includes(searchLower) ||
        f.answer.toLowerCase().includes(searchLower)
      );
    }
    
    //const result = paginate(faqsList, page, limit);
    const { data, pagination } = paginate(faqsList, page, limit);

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

export const getFAQById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const faq = await storage.getFAQById(id);
    
    if (!faq) {
      return errorResponse(res, "FAQ tidak ditemukan", 404);
    }
    
    return successResponse(res, faq, "Detail FAQ");
  } catch (error) {
    next(error);
  }
};

export const createFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = insertFAQSchema.parse({
      ...req.body,
      createdBy: req.user!.id,
    });
    
    const faq = await storage.createFAQ(validatedData);
    return successResponse(res, faq, "FAQ berhasil dibuat", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Validation error", 400, error.errors);
    }
    next(error);
  }
};

export const updateFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updates = {
      ...req.body,
      updatedBy: req.user!.id,
    };
    
    await storage.updateFAQ(id, updates);
    return successResponse(res, null, "FAQ berhasil diupdate");
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteFAQ(id);
    
    return successResponse(res, null, "FAQ berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

export const reorderFAQs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orders } = req.body;
    
    if (!Array.isArray(orders)) {
      return errorResponse(res, "Orders must be an array", 400);
    }
    
    await storage.reorderFAQs(orders);
    return successResponse(res, null, "FAQ berhasil diurutkan");
  } catch (error) {
    next(error);
  }
};
