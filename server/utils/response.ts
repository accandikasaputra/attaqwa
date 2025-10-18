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

export const successResponse = (
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
