import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        fullName?: string;
        role: "admin" | "bendahara" | "ketua" | "tim_konstruksi" | "tim_procurement";
        isActive?: number;
      };
    }
  }
}

export {}; // penting agar TypeScript treat ini sebagai modul
