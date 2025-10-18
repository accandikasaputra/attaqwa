import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { hashPassword, generateToken } from "../auth";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import passport from "../auth";
import { successResponse, errorResponse } from "../utils/response";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return errorResponse(res, "Email sudah terdaftar", 400);
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    return successResponse(res, { user: userWithoutPassword }, "Registrasi berhasil", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Validation error", 400, error.errors);
    }
    next(error);
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      console.error("Login error:", err);
      return errorResponse(res, "Terjadi kesalahan server", 500);
    }

    if (!user) {
      return errorResponse(res, info?.message || "Email atau password salah", 401);
    }

    try {
      const token = generateToken(user);
      
      return successResponse(res, {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
        },
      }, "Login berhasil");
    } catch (error: any) {
      console.error("JWT error:", error);
      return errorResponse(res, "Gagal menghasilkan token", 500);
    }
  })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return errorResponse(res, "Logout gagal", 500);
    }
    return successResponse(res, null, "Logout berhasil");
  });
};

export const me = (req: Request, res: Response) => {
  const user = (req as any).user;
  return successResponse(res, user, "Token valid");
};
