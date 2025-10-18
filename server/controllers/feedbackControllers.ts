import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";
import { paginate, getPaginationParams } from "../utils/pagination";

export const getAllFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query;
    const { page, limit } = getPaginationParams(req.query);
    
    let feedbackList = await storage.getAllFeedback();
    
    if (status) {
      feedbackList = feedbackList.filter(f => f.status === status);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      feedbackList = feedbackList.filter(f =>
        f.name.toLowerCase().includes(searchLower) ||
        f.subject.toLowerCase().includes(searchLower) ||
        f.message.toLowerCase().includes(searchLower)
      );
    }
    
    const { data, pagination } = paginate(feedbackList, page, limit);

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

export const getFeedbackById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const feedbackItem = await storage.getFeedbackById(id);
    
    if (!feedbackItem) {
      return errorResponse(res, "Feedback tidak ditemukan", 404);
    }
    
    return successResponse(res, feedbackItem, "Detail feedback");
  } catch (error) {
    next(error);
  }
};

export const createFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = insertFeedbackSchema.parse(req.body);
    const feedbackItem = await storage.createFeedback(validatedData);
    
    return successResponse(res, feedbackItem, "Feedback berhasil dikirim", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Validation error", 400, error.errors);
    }
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.markFeedbackAsRead(id, req.user!.id);
    
    return successResponse(res, null, "Feedback ditandai sudah dibaca");
  } catch (error) {
    next(error);
  }
};

export const replyFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { reply } = req.body;
    
    if (!reply || !reply.trim()) {
      return errorResponse(res, "Reply tidak boleh kosong", 400);
    }
    
    await storage.replyFeedback(id, reply.trim(), req.user!.id);
    return successResponse(res, null, "Reply berhasil dikirim");
  } catch (error) {
    next(error);
  }
};

export const deleteFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteFeedback(id);
    
    return successResponse(res, null, "Feedback berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
