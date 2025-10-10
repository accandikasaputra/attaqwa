import type { Response } from "express";

interface ApiResponse<T = any> {
  data: T | null;
  message: string;
}

/**
 * ✅ Kirim response sukses terstandar
 */
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  data: T,
  message = "Success"
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    data,
    message,
  });
}

/**
 * ❌ Kirim response error terstandar
 */
export function sendError(
  res: Response,
  statusCode = 500,
  message = "Something went wrong",
  error?: unknown
): Response<ApiResponse<null>> {
  if (error) console.error(error);

  return res.status(statusCode).json({
    data: null,
    message,
  });
}
