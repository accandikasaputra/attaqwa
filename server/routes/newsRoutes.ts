import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { storage } from "../storage";
import { insertNewsSchema } from "@shared/schema";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

const router = Router();

// Helper: Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ==================== CMS ROUTES (Protected) ====================

/**
 * GET /api/news - Get all news with pagination & search (CMS)
 * Query params: page, limit, search, category, status
 */
router.get("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      category = "",
      status = "",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Get all news from storage
    let allNews = await storage.getAllNews();

    // Filter by search
    if (search) {
      const searchLower = (search as string).toLowerCase();
      allNews = allNews.filter(
        (news) =>
          news.title.toLowerCase().includes(searchLower) ||
          news.excerpt.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (category) {
      allNews = allNews.filter((news) => news.category === category);
    }

    // Filter by status
    if (status) {
      allNews = allNews.filter((news) => news.status === status);
    }

    const total = allNews.length;

    // Apply pagination
    const paginatedNews = allNews.slice(offset, offset + limitNum);

    return res.json({
      success: true,
      message: "Berita berhasil diambil",
      data: paginatedNews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/news/:id - Get single news by ID (CMS)
 */
router.get("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    const article = await storage.getNewsById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Berita berhasil diambil",
      data: article,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/news - Create news (CMS)
 */
router.post("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate input
    const validatedData = insertNewsSchema.parse(req.body);

    // Generate slug from title
    let slug = generateSlug(validatedData.title);

    // Check if slug exists
    const allNews = await storage.getAllNews();
    const existingSlug = allNews.find((n) => n.slug === slug);

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Set publishedAt if status is published
    const publishedAt = validatedData.status === "published" ? new Date() : null;

    // Create news
    const article = await storage.createNews({
      ...validatedData,
      slug,
      authorId: user.id,
      publishedAt,
    });

    return res.status(201).json({
      success: true,
      message: "Berita berhasil dibuat",
      data: article,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: error.errors,
      });
    }
    next(error);
  }
});

/**
 * PUT /api/news/:id - Update news (CMS)
 */
router.put("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    // Check if news exists
    const existing = await storage.getNewsById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      });
    }

    // Validate input (partial update)
    const validatedData = insertNewsSchema.partial().parse(req.body);

    // Generate new slug if title changed
    let slug = existing.slug;
    if (validatedData.title && validatedData.title !== existing.title) {
      slug = generateSlug(validatedData.title);

      // Check if new slug exists
      const allNews = await storage.getAllNews();
      const existingSlug = allNews.find((n) => n.slug === slug && n.id !== id);
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Update publishedAt if status changed to published
    let publishedAt = existing.publishedAt;
    if (validatedData.status === "published" && existing.status !== "published") {
      publishedAt = new Date();
    }

    // Update news
    await storage.updateNews(id, {
      ...validatedData,
      slug,
      publishedAt,
    });

    // Get updated news
    const updated = await storage.getNewsById(id);

    return res.json({
      success: true,
      message: "Berita berhasil diupdate",
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: error.errors,
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/news/:id - Delete news (CMS)
 */
router.delete("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    // Check if user is admin
    if (user.role !== "admin" && user.role !== "ketua") {
      return res.status(403).json({
        success: false,
        message: "Hanya admin/ketua yang bisa menghapus berita",
      });
    }

    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    // Check if news exists
    const existing = await storage.getNewsById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      });
    }

    // Delete news
    await storage.deleteNews(id);

    return res.json({
      success: true,
      message: "Berita berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
});

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/news/public/list - Get published news (Frontend)
 * Query params: page, limit, category
 */
router.get("/public/list", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = "1",
      limit = "10",
      category = "",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Get published news
    let publishedNews = await storage.getPublishedNews();

    // Filter by category
    if (category) {
      publishedNews = publishedNews.filter((news) => news.category === category);
    }

    const total = publishedNews.length;

    // Apply pagination
    const paginatedNews = publishedNews.slice(offset, offset + limitNum);

    // Remove sensitive data
    const sanitizedNews = paginatedNews.map((news) => ({
      id: news.id,
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      imageUrl: news.imageUrl,
      category: news.category,
      publishedAt: news.publishedAt,
    }));

    return res.json({
      success: true,
      message: "Berita berhasil diambil",
      data: sanitizedNews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/news/public/:slug - Get published news by slug (Frontend)
 */
router.get("/public/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const allNews = await storage.getPublishedNews();
    const article = allNews.find((n) => n.slug === slug);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      });
    }

    // Sanitize response
    const sanitizedArticle = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      imageUrl: article.imageUrl,
      category: article.category,
      publishedAt: article.publishedAt,
    };

    return res.json({
      success: true,
      message: "Berita berhasil diambil",
      data: sanitizedArticle,
    });
  } catch (error) {
    next(error);
  }
});

export default router;