import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "./auth";
import { hashPassword } from "./auth";
import { storage } from "./storage";
import { generateToken } from "./auth.js";

import {
  isAuthenticated,
  isAdmin,
  canCreateTransaction,
  canApproveBendahara,
  canApproveKetua,
} from "./middleware/auth";
import {
  insertUserSchema,
  insertTransactionSchema,
  insertDonationSchema,
  insertNewsSchema,
  insertBankAccountSchema,
  insertFeedbackSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== AUTH ROUTES ====================
  
  // Register
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email sudah terdaftar" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // Login
  // ==================== AUTH ROUTES ====================

// Login (JWT-based)
app.post("/api/auth/login", (req, res, next) => {
  console.log("🔥 Login endpoint called!");

  passport.authenticate("local", { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }

    if (!user) {
      console.warn("Login gagal:", info?.message);
      return res.status(401).json({
        success: false,
        message: info?.message || "Email atau password salah.",
      });
    }

    try {
      // ✅ Generate JWT token langsung
      const token = generateToken(user);
      console.log("✅ Token generated:", token);

      return res.status(200).json({
        success: true,
        message: "Login berhasil",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isActive: user.isActive,
          },
        },
      });
    } catch (error: any) {
      console.error("JWT error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal menghasilkan token.",
      });
    }
  })(req, res, next);
});



  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout gagal" });
      }
      res.json({ message: "Logout berhasil" });
    });
  });

  // Check session
  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });

  // ==================== TRANSACTION ROUTES ====================

  // Get all transactions
  app.get("/api/transactions", isAuthenticated, async (req, res, next) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  // Get transactions by status
  app.get("/api/transactions/status/:status", isAuthenticated, async (req, res, next) => {
    try {
      const { status } = req.params;
      const transactions = await storage.getTransactionsByStatus(status);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  // Create transaction
  app.post("/api/transactions", canCreateTransaction, async (req, res, next) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Set createdBy to current user
      const transaction = await storage.createTransaction({
        ...validatedData,
        createdBy: req.user!.id,
      });

      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // Approve transaction as bendahara
  app.post("/api/transactions/:id/approve-bendahara", canApproveBendahara, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaksi tidak ditemukan" });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ error: "Status transaksi tidak valid untuk approval" });
      }

      await storage.updateTransactionStatus(id, 'approved_bendahara', req.user!.id);
      res.json({ message: "Transaksi berhasil disetujui bendahara" });
    } catch (error) {
      next(error);
    }
  });

  // Approve transaction as ketua
  app.post("/api/transactions/:id/approve-ketua", canApproveKetua, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaksi tidak ditemukan" });
      }

      if (transaction.status !== 'approved_bendahara') {
        return res.status(400).json({ error: "Transaksi harus disetujui bendahara dulu" });
      }

      await storage.updateTransactionStatus(id, 'approved', req.user!.id);
      res.json({ message: "Transaksi berhasil disetujui ketua" });
    } catch (error) {
      next(error);
    }
  });

  // ==================== DONATION ROUTES ====================

  // Get all donations
  app.get("/api/donations", isAuthenticated, async (req, res, next) => {
    try {
      const donations = await storage.getAllDonations();
      res.json(donations);
    } catch (error) {
      next(error);
    }
  });

  // Get pending donations
  app.get("/api/donations/pending", isAuthenticated, async (req, res, next) => {
    try {
      const donations = await storage.getPendingDonations();
      res.json(donations);
    } catch (error) {
      next(error);
    }
  });

  // Create donation (public)
  app.post("/api/donations", async (req, res, next) => {
    try {
      const validatedData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(validatedData);
      res.status(201).json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // Approve donation
  app.post("/api/donations/:id/approve", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.approveDonation(id, req.user!.id);
      res.json({ message: "Donasi berhasil disetujui" });
    } catch (error) {
      next(error);
    }
  });

  // Reject donation
  app.post("/api/donations/:id/reject", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      await storage.rejectDonation(id, req.user!.id, reason);
      res.json({ message: "Donasi ditolak" });
    } catch (error) {
      next(error);
    }
  });

  // ==================== NEWS ROUTES ====================

  // Get all news (admin)
  app.get("/api/news/all", isAuthenticated, async (req, res, next) => {
    try {
      const allNews = await storage.getAllNews();
      res.json(allNews);
    } catch (error) {
      next(error);
    }
  });

  // Get published news (public)
  app.get("/api/news", async (req, res, next) => {
    try {
      const publishedNews = await storage.getPublishedNews();
      res.json(publishedNews);
    } catch (error) {
      next(error);
    }
  });

  // Get single news
  app.get("/api/news/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getNewsById(id);
      if (!article) {
        return res.status(404).json({ error: "Berita tidak ditemukan" });
      }
      res.json(article);
    } catch (error) {
      next(error);
    }
  });

  // Create news
  app.post("/api/news", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertNewsSchema.parse(req.body);
      const article = await storage.createNews({
        ...validatedData,
        authorId: req.user!.id,
      });
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // Update news
  app.patch("/api/news/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateNews(id, req.body);
      res.json({ message: "Berita berhasil diupdate" });
    } catch (error) {
      next(error);
    }
  });

  // Delete news
  app.delete("/api/news/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNews(id);
      res.json({ message: "Berita berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  });

  // ==================== BANK ACCOUNT ROUTES ====================

  // Get active bank accounts (public)
  app.get("/api/bank-accounts", async (req, res, next) => {
    try {
      const accounts = await storage.getActiveBankAccounts();
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  });

  // Get all bank accounts (admin)
  app.get("/api/bank-accounts/all", isAdmin, async (req, res, next) => {
    try {
      const accounts = await storage.getAllBankAccounts();
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  });

  // Create bank account
  app.post("/api/bank-accounts", isAdmin, async (req, res, next) => {
    try {
      const validatedData = insertBankAccountSchema.parse(req.body);
      const account = await storage.createBankAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // ==================== FEEDBACK ROUTES ====================

  // Get all feedback (admin)
  app.get("/api/feedback", isAuthenticated, async (req, res, next) => {
    try {
      const allFeedback = await storage.getAllFeedback();
      res.json(allFeedback);
    } catch (error) {
      next(error);
    }
  });

  // Create feedback (public)
  app.post("/api/feedback", async (req, res, next) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedbackItem = await storage.createFeedback(validatedData);
      res.status(201).json(feedbackItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // Mark feedback as read
  app.post("/api/feedback/:id/read", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markFeedbackAsRead(id, req.user!.id);
      res.json({ message: "Feedback ditandai sudah dibaca" });
    } catch (error) {
      next(error);
    }
  });

  // ==================== STATS/DASHBOARD ROUTES ====================

  // Get cash flow summary (public)
  app.get("/api/stats/cash-flow", async (req, res, next) => {
    try {
      const allTransactions = await storage.getAllTransactions();
      
      // Only count approved transactions
      const approved = allTransactions.filter(t => t.status === 'approved');
      
      const totalPemasukan = approved
        .filter(t => t.type === 'pemasukan')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalPengeluaran = approved
        .filter(t => t.type === 'pengeluaran')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const saldo = totalPemasukan - totalPengeluaran;

      res.json({
        totalPemasukan,
        totalPengeluaran,
        saldo,
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
