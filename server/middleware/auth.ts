import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      fullName: string;
      role: 'admin' | 'bendahara' | 'ketua' | 'tim_konstruksi' | 'tim_procurement';
      isActive: number;
    }
  }
}
interface JwtPayload {
  id: number;
  email: string;
  fullName?: string;
  role: "admin" | "bendahara" | "ketua" | "tim_konstruksi" | "tim_procurement";
  isActive?: number;
}

// Middleware utama: verifikasi token JWT dan isi req.user
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "masjid-attaqwa-secret") as JwtPayload;

    (req as any).user = decoded; // Simpan data user
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token tidak valid" });
  }
}

// Middleware: cek role yang diizinkan
export function hasRole(...roles: JwtPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: "Forbidden. Anda tidak memiliki izin untuk mengakses resource ini.",
      });
    }

    next();
  };
}

// Middleware-middleware role khusus
export const canManagePO = hasRole("tim_konstruksi", "tim_procurement");
export const isAdmin = hasRole("admin");
export const isBendaharaOrAdmin = hasRole("admin", "bendahara");
export const isKetuaOrAdmin = hasRole("admin", "ketua");
export const canCreateTransaction = hasRole("admin", "tim_konstruksi", "tim_procurement");
export const canApproveBendahara = hasRole("admin", "bendahara");
export const canApproveKetua = hasRole("admin", "ketua");
