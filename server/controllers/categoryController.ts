import { Request, Response } from "express";
import { successResponse } from "../utils/response";

export const getCategories = async (req: Request, res: Response) => {
  const categories = [
    { key: "update-pembangunan", label: "Update Pembangunan" },
    { key: "kegiatan", label: "Kegiatan" },
    { key: "pengumuman", label: "Pengumuman" },
  ];
  
  return successResponse(res, categories, "Daftar kategori berita");
};