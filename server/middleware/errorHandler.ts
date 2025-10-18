import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Data tidak valid",
      errors: err.errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
};