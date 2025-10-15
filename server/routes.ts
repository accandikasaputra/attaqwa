import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "./auth";
import { hashPassword } from "./auth";
import { storage } from "./storage";
import { generateToken } from "./auth.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import newsRoutes from "./routes/newsRoutes";

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
  insertFAQSchema,
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
  app.get("/api/auth/me", authMiddleware, (req, res) => {
    const user = (req as any).user;
    res.json({
      success: true,
      message: "Token valid",
      user,
    });
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
  app.post("/api/transactions/:id/approve-bendahara", isAuthenticated,canApproveBendahara, async (req, res, next) => {
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
  app.post("/api/transactions/:id/approve-ketua",isAuthenticated, canApproveKetua, async (req, res, next) => {
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

  // Get all donations with filters
  app.get("/api/donations", isAuthenticated, async (req, res, next) => {
    try {
      const { status, donorType, donationType, search } = req.query;
      
      let donations = await storage.getAllDonations();
      
      // Apply filters
      if (status) {
        donations = donations.filter(d => d.status === status);
      }
      if (donorType) {
        donations = donations.filter(d => d.donorType === donorType);
      }
      if (donationType) {
        donations = donations.filter(d => d.donationType === donationType);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        donations = donations.filter(d => 
          d.donorName.toLowerCase().includes(searchLower) ||
          (d.notes && d.notes.toLowerCase().includes(searchLower))
        );
      }
      
      res.json({
        success: true,
        message: "Daftar donasi",
        data: donations,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get donation detail
  app.get("/api/donations/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.getDonationById(id);
      
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donasi tidak ditemukan"
        });
      }
      
      res.json({
        success: true,
        message: "Detail donasi",
        data: donation,
      });
    } catch (error) {
      next(error);
    }
  });

  // Create donation
  app.post("/api/donations", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user!;
      
      // Check if user can create donation
      if (!['bendahara', 'tim_pendanaan'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses untuk membuat donasi"
        });
      }
      
      const {
        donorName,
        donorEmail,
        donorPhone,
        donorType,
        donationType,
        amount,
        showName,
        paymentMethod,
        paymentProofUrl,
        notes,
        donationDate,
      } = req.body;
      
      // Validation
      if (!donorName || !amount) {
        return res.status(400).json({
          success: false,
          message: "Nama donatur dan jumlah harus diisi"
        });
      }
      donationDate: new Date(donationDate)

      // Create donation
      const donation = await storage.createDonation({
        donorName,
        donorEmail,
        donorPhone,
        donorType: donorType || "warga",
        donationType: donationType || "sumbangan",
        amount: amount.toString(),
        showName: showName ? 1 : 0,
        status: "draft",
        createdBy: user.id,
        createdByRole: user.role as "bendahara" | "tim_pendanaan",
        paymentMethod,
        paymentProofUrl,
        notes,
        donationDate:  new Date(donationDate),
      });
      
      res.status(201).json({
        success: true,
        message: "Donasi berhasil dibuat",
        data: donation,
      });
    } catch (error) {
      next(error);
    }
  });

  // Update donation (only draft)
  app.put("/api/donations/:id", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      
      const donation = await storage.getDonationById(id);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donasi tidak ditemukan"
        });
      }
      
      // Check ownership
      if (donation.createdBy !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat mengubah donasi ini"
        });
      }
      
      // Can only update draft
      if (donation.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: "Hanya donasi dengan status draft yang dapat diubah"
        });
      }
      
      const {
        donorName,
        donorEmail,
        donorPhone,
        donorType,
        donationType,
        amount,
        showName,
        paymentMethod,
        paymentProofUrl,
        notes,
        donationDate,
      } = req.body;
      
      await storage.updateDonation(id, {
        donorName,
        donorEmail,
        donorPhone,
        donorType,
        donationType,
        amount: amount ? amount.toString() : undefined,
        showName: showName !== undefined ? (showName ? 1 : 0) : undefined,
        paymentMethod,
        paymentProofUrl,
        notes,
        donationDate,
      });
      
      res.json({
        success: true,
        message: "Donasi berhasil diubah",
      });
    } catch (error) {
      next(error);
    }
  });

  // Submit donation for review/approval
  app.put("/api/donations/:id/submit", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      
      const donation = await storage.getDonationById(id);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donasi tidak ditemukan"
        });
      }
      
      // Check ownership
      if (donation.createdBy !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat submit donasi ini"
        });
      }
      
      if (donation.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: "Donasi sudah di-submit"
        });
      }
      
      await storage.submitDonation(id);
      
      const newStatus = donation.createdByRole === 'bendahara' 
        ? 'approved_bendahara' 
        : 'pending_review';
      
      res.json({
        success: true,
        message: donation.createdByRole === 'bendahara'
          ? "Donasi berhasil di-submit, menunggu approval ketua"
          : "Donasi berhasil di-submit untuk review bendahara",
        data: { status: newStatus },
      });
    } catch (error) {
      next(error);
    }
  });

  // Review donation by bendahara (for tim_pendanaan's donation)
  app.put("/api/donations/:id/review-bendahara", canApproveBendahara, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      const { action, rejectionReason } = req.body;
      
      const donation = await storage.getDonationById(id);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donasi tidak ditemukan"
        });
      }
      
      if (donation.status !== 'pending_review') {
        return res.status(400).json({
          success: false,
          message: "Donasi tidak dalam status review"
        });
      }
      
      if (action === 'reject') {
        await storage.updateDonation(id, {
          status: "rejected",
          rejectedBy: user.id,
          rejectedAt: new Date(),
          rejectionReason,
        });
        
        return res.json({
          success: true,
          message: "Donasi ditolak",
          data: { status: "rejected" },
        });
      }
      
      // Approve
      await storage.updateDonation(id, {
        status: "approved_bendahara",
        reviewedByBendahara: user.id,
        reviewedByBendaharaAt: new Date(),
      });
      
      res.json({
        success: true,
        message: "Donasi berhasil di-approve, menunggu approval ketua",
        data: { status: "approved_bendahara" },
      });
    } catch (error) {
      next(error);
    }
  });

  // Approve donation by ketua (final approval)
  app.put("/api/donations/:id/approve-ketua", isAuthenticated,canApproveKetua, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      const { action, rejectionReason } = req.body;
      
      const donation = await storage.getDonationById(id);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donasi tidak ditemukan"
        });
      }
      
      if (donation.status !== 'approved_bendahara') {
        return res.status(400).json({
          success: false,
          message: "Donasi harus di-approve bendahara terlebih dahulu"
        });
      }
      
      if (action === 'reject') {
        await storage.updateDonation(id, {
          status: "rejected",
          rejectedBy: user.id,
          rejectedAt: new Date(),
          rejectionReason,
        });
        
        return res.json({
          success: true,
          message: "Donasi ditolak",
          data: { status: "rejected" },
        });
      }
      
      // Generate cash flow description
      const donorDisplay = donation.showName 
        ? `${donation.donorName}`
        : "Hamba Allah";
      
      const typeLabel = donation.donationType === "iuran" ? "Iuran" : "Donasi";
      const description = `${typeLabel} dari ${donorDisplay}`;
      
      // Create cash flow entry
      const cashFlow = await storage.createTransaction({
        type: "pemasukan",
        category: "Donasi",
        description,
        amount: donation.amount.toString(),
        status: "approved",
        createdBy: user.id,
        createdByTeam: "admin",
        transactionDate: donation.donationDate,
        approvedByKetua: user.id,
        approvedAt: new Date(),
      });
      
      // Update donation
      await storage.updateDonation(id, {
        status: "approved",
        approvedBy: user.id,
        approvedAt: new Date(),
        cashFlowId: cashFlow.id,
      });
      
      res.json({
        success: true,
        message: "Donasi berhasil di-approve dan masuk ke cash flow",
        data: {
          status: "approved",
          cashFlowId: cashFlow.id,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete donation (only draft)
  app.delete("/api/donations/:id", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      
      const donation = await storage.getDonationById(id);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donasi tidak ditemukan"
        });
      }
      
      // Check ownership
      if (donation.createdBy !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat menghapus donasi ini"
        });
      }
      
      // Can only delete draft
      if (donation.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: "Hanya donasi dengan status draft yang dapat dihapus"
        });
      }
      
      await storage.deleteDonation(id);
      
      res.json({
        success: true,
        message: "Donasi berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  });


  // ==================== CATEGORY ROUTES ====================

  // Static list (karena kategori fixed)
  app.get("/api/categories", async (_req, res) => {
    res.json({
      success: true,
      message: "Daftar kategori berita",
      data: [
        { key: "update-pembangunan", label: "Update Pembangunan" },
        { key: "kegiatan", label: "Kegiatan" },
        { key: "pengumuman", label: "Pengumuman" },
      ],
    });
  });

  // Get news by category
  app.get("/api/news/category/:category", async (req, res, next) => {
    try {
      const { category } = req.params;
      const newsList = await storage.getNewsByCategory(category);

      res.json({
        success: true,
        message: `Berita untuk kategori ${category}`,
        data: newsList,
      });
    } catch (error) {
      next(error);
    }
  });
  // ==================== NEWS ROUTES ====================

  app.use("/api/news", newsRoutes);

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
      const { status, search } = req.query;
      
      let feedbackList = await storage.getAllFeedback();
      
      // Apply filters
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
      
      res.json({
        success: true,
        message: "Daftar feedback",
        data: feedbackList,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get feedback by ID
  app.get("/api/feedback/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const feedbackItem = await storage.getFeedbackById(id);
      
      if (!feedbackItem) {
        return res.status(404).json({
          success: false,
          message: "Feedback tidak ditemukan"
        });
      }
      
      res.json({
        success: true,
        message: "Detail feedback",
        data: feedbackItem,
      });
    } catch (error) {
      next(error);
    }
  });

  // Create feedback (public)
  app.post("/api/feedback", async (req, res, next) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedbackItem = await storage.createFeedback(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Feedback berhasil dikirim",
        data: feedbackItem,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: "Validation error",
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  // Mark feedback as read
  app.put("/api/feedback/:id/read", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markFeedbackAsRead(id, req.user!.id);
      
      res.json({
        success: true,
        message: "Feedback ditandai sudah dibaca",
      });
    } catch (error) {
      next(error);
    }
  });

  // Reply to feedback
  app.put("/api/feedback/:id/reply", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { reply } = req.body;
      
      if (!reply || !reply.trim()) {
        return res.status(400).json({
          success: false,
          message: "Reply tidak boleh kosong"
        });
      }
      
      await storage.replyFeedback(id, reply.trim(), req.user!.id);
      
      res.json({
        success: true,
        message: "Reply berhasil dikirim",
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete feedback
  app.delete("/api/feedback/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFeedback(id);
      
      res.json({
        success: true,
        message: "Feedback berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  });

  // ==================== FAQ ROUTES ====================

  // Get all FAQs (public - only active)
  app.get("/api/faqs", async (req, res, next) => {
    try {
      const faqs = await storage.getActiveFAQs();
      
      res.json({
        success: true,
        message: "Daftar FAQ",
        data: faqs,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all FAQs (admin - including inactive)
  app.get("/api/faqs/all", isAuthenticated, async (req, res, next) => {
    try {
      const { category, search } = req.query;
      
      let faqsList = await storage.getAllFAQs();
      
      // Apply filters
      if (category) {
        faqsList = faqsList.filter(f => f.category === category);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        faqsList = faqsList.filter(f =>
          f.question.toLowerCase().includes(searchLower) ||
          f.answer.toLowerCase().includes(searchLower)
        );
      }
      
      res.json({
        success: true,
        message: "Daftar FAQ",
        data: faqsList,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get FAQ by ID
  app.get("/api/faqs/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const faq = await storage.getFAQById(id);
      
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: "FAQ tidak ditemukan"
        });
      }
      
      res.json({
        success: true,
        message: "Detail FAQ",
        data: faq,
      });
    } catch (error) {
      next(error);
    }
  });

  // Create FAQ
  app.post("/api/faqs", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertFAQSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      
      const faq = await storage.createFAQ(validatedData);
      
      res.status(201).json({
        success: true,
        message: "FAQ berhasil dibuat",
        data: faq,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: "Validation error",
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  // Update FAQ
  app.put("/api/faqs/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updates = {
        ...req.body,
        updatedBy: req.user!.id,
      };
      
      await storage.updateFAQ(id, updates);
      
      res.json({
        success: true,
        message: "FAQ berhasil diupdate",
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete FAQ
  app.delete("/api/faqs/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFAQ(id);
      
      res.json({
        success: true,
        message: "FAQ berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  });

  // Reorder FAQs
  app.put("/api/faqs/reorder", isAuthenticated, async (req, res, next) => {
    try {
      const { orders } = req.body;
      
      if (!Array.isArray(orders)) {
        return res.status(400).json({
          success: false,
          message: "Orders must be an array"
        });
      }
      
      await storage.reorderFAQs(orders);
      
      res.json({
        success: true,
        message: "FAQ berhasil diurutkan",
      });
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

  // Get cash flow statistics
  app.get("/api/cashflow/statistics", async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      
      let transactions = await storage.getAllTransactions();
      
      // Filter by date range if provided
      if (startDate && endDate) {
        transactions = transactions.filter(t => {
          const txDate = new Date(t.transactionDate);
          return txDate >= new Date(startDate as string) && 
                txDate <= new Date(endDate as string);
        });
      }
      
      // Only count approved transactions
      const approved = transactions.filter(t => t.status === 'approved');
      
      const totalPemasukan = approved
        .filter(t => t.type === 'pemasukan')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalPengeluaran = approved
        .filter(t => t.type === 'pengeluaran')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const saldo = totalPemasukan - totalPengeluaran;
      
      // Category breakdown for pengeluaran
      const categoryBreakdown: Record<string, number> = {};
      approved
        .filter(t => t.type === 'pengeluaran')
        .forEach(t => {
          if (!categoryBreakdown[t.category]) {
            categoryBreakdown[t.category] = 0;
          }
          categoryBreakdown[t.category] += Number(t.amount);
        });
      
      // Monthly trend (last 6 months)
      const monthlyTrend: any[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthTransactions = approved.filter(t => {
          const txDate = new Date(t.transactionDate);
          return txDate >= month && txDate <= monthEnd;
        });
        
        const pemasukan = monthTransactions
          .filter(t => t.type === 'pemasukan')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const pengeluaran = monthTransactions
          .filter(t => t.type === 'pengeluaran')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        monthlyTrend.push({
          month: month.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
          pemasukan,
          pengeluaran,
          net: pemasukan - pengeluaran,
        });
      }
      
      res.json({
        success: true,
        data: {
          totalPemasukan,
          totalPengeluaran,
          saldo,
          categoryBreakdown,
          monthlyTrend,
          totalTransactions: approved.length,
          pendingApprovals: transactions.filter(t => 
            t.status === 'pending' || 
            t.status === 'approved_bendahara'
          ).length,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get cash flow list with filters (enhanced version)
  app.get("/api/cashflow", async (req, res, next) => {
    try {
      const { 
        type, 
        category, 
        status, 
        startDate, 
        endDate, 
        search,
        page = 1,
        limit = 20,
      } = req.query;
      
      let transactions = await storage.getAllTransactions();
      
      // Apply filters
      if (type) {
        transactions = transactions.filter(t => t.type === type);
      }
      if (category) {
        transactions = transactions.filter(t => t.category === category);
      }
      if (status) {
        transactions = transactions.filter(t => t.status === status);
      }
      if (startDate && endDate) {
        transactions = transactions.filter(t => {
          const txDate = new Date(t.transactionDate);
          return txDate >= new Date(startDate as string) && 
                txDate <= new Date(endDate as string);
        });
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        transactions = transactions.filter(t =>
          t.description.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower)
        );
      }
      
      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedTransactions = transactions.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          transactions: paginatedTransactions,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: transactions.length,
            totalPages: Math.ceil(transactions.length / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all POs with filters
  app.get("/api/po", authMiddleware, async (req, res, next) => {
    try {
      const { status, category, role, search } = req.query;
      
      let pos = await storage.getAllPurchaseOrders();
      
      // Apply filters
      if (status) {
        pos = pos.filter(po => po.status === status);
      }
      if (category) {
        pos = pos.filter(po => po.category === category);
      }
      if (role) {
        pos = pos.filter(po => po.createdByRole === role);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        pos = pos.filter(po => 
          po.poNumber.toLowerCase().includes(searchLower) ||
          (po.notes && po.notes.toLowerCase().includes(searchLower))
        );
      }
      
      // Get item counts for each PO
      const posWithCounts = await Promise.all(
        pos.map(async (po) => {
          const items = await storage.getPOItemsByPOId(po.id);
          return {
            ...po,
            itemCount: items.length,
          };
        })
      );
      
      res.json({
        success: true,
        message: "Daftar Purchase Order",
        data: posWithCounts,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get PO detail with items
  app.get("/api/po/:id", authMiddleware, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const po = await storage.getPurchaseOrderById(id);
      
      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase Order tidak ditemukan"
        });
      }
      
      const items = await storage.getPOItemsByPOId(id);
      
      res.json({
        success: true,
        message: "Detail Purchase Order",
        data: {
          ...po,
          items,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Create PO
  app.post("/api/po", authMiddleware, async (req, res, next) => {
    try {
      const user = req.user!;
      
      // Check if user can create PO
      if (!['admin','tim_konstruksi', 'tim_procurement'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses untuk membuat PO"
        });
      }
      
      const { category, notes, items } = req.body;
      
      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "PO harus memiliki minimal 1 item"
        });
      }
      
      // Generate PO number
      const poNumber = await storage.generatePONumber();
      
      // Create PO
      const po = await storage.createPurchaseOrder({
        poNumber,
        category,
        notes,
        totalAmount: "0",
        status: "draft",
        createdBy: user.id,
        createdByRole: user.role as "tim_konstruksi" | "tim_procurement",
      });
      
      // Create items
      let totalAmount = 0;
      for (const item of items) {
        const unitPrice = item.unitPrice || null;
        const totalPrice = unitPrice ? item.quantity * unitPrice : null;
        
        await storage.createPOItem({
          poId: po.id,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: unitPrice ? unitPrice.toString() : null,
          totalPrice: totalPrice ? totalPrice.toString() : null,
          notes: item.notes,
        });
        
        if (totalPrice) {
          totalAmount += totalPrice;
        }
      }
      
      // Update total amount
      await storage.updatePurchaseOrder(po.id, {
        totalAmount: totalAmount.toString(),
      });
      
      res.status(201).json({
        success: true,
        message: "Purchase Order berhasil dibuat",
        data: {
          id: po.id,
          poNumber: po.poNumber,
          status: po.status,
          totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Input price (tim_procurement only)
  app.put("/api/po/:id/input-price", authMiddleware, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      
      if (user.role !== 'tim_procurement') {
        return res.status(403).json({
          success: false,
          message: "Hanya tim procurement yang dapat input harga"
        });
      }
      
      const po = await storage.getPurchaseOrderById(id);
      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase Order tidak ditemukan"
        });
      }
      
      if (po.createdByRole !== 'tim_konstruksi') {
        return res.status(400).json({
          success: false,
          message: "Hanya PO dari tim konstruksi yang perlu input harga"
        });
      }
      
      if (po.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: "PO sudah diproses, tidak dapat diubah"
        });
      }
      
      const { items } = req.body;
      
      let totalAmount = 0;
      for (const item of items) {
        const totalPrice = item.quantity * item.unitPrice;
        
        await storage.updatePOItem(item.id, {
          unitPrice: item.unitPrice.toString(),
          totalPrice: totalPrice.toString(),
        });
        
        totalAmount += totalPrice;
      }
      
      await storage.updatePurchaseOrder(id, {
        totalAmount: totalAmount.toString(),
      });
      
      res.json({
        success: true,
        message: "Harga berhasil diinput",
        data: {
          poNumber: po.poNumber,
          totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Submit PO for review
  app.put("/api/po/:id/submit", authMiddleware, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      
      if (user.role !== 'tim_procurement') {
        return res.status(403).json({
          success: false,
          message: "Hanya tim procurement yang dapat submit PO"
        });
      }
      
      const po = await storage.getPurchaseOrderById(id);
      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase Order tidak ditemukan"
        });
      }
      
      if (po.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: "PO sudah di-submit"
        });
      }
      
      // Validate all items have prices
      const items = await storage.getPOItemsByPOId(id);
      const hasIncompletePrices = items.some(item => !item.unitPrice || !item.totalPrice);
      
      if (hasIncompletePrices) {
        return res.status(400).json({
          success: false,
          message: "Semua item harus memiliki harga sebelum di-submit"
        });
      }
      
      await storage.updatePurchaseOrder(id, {
        status: "pending_review",
      });
      
      res.json({
        success: true,
        message: "PO berhasil di-submit untuk review",
        data: {
          poNumber: po.poNumber,
          status: "pending_review",
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Review by Bendahara
  app.put("/api/po/:id/review-bendahara", authMiddleware,canApproveBendahara, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      const { action, selectedItems, rejectionReason } = req.body;
      
      const po = await storage.getPurchaseOrderById(id);
      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase Order tidak ditemukan"
        });
      }
      
      if (po.status !== 'pending_review') {
        return res.status(400).json({
          success: false,
          message: "PO tidak dalam status review"
        });
      }
      
      if (action === 'reject') {
        await storage.updatePurchaseOrder(id, {
          status: "rejected",
          rejectedBy: user.id,
          rejectedAt: new Date(),
          rejectionReason,
        });
        
        return res.json({
          success: true,
          message: "PO ditolak",
          data: {
            poNumber: po.poNumber,
            status: "rejected",
          },
        });
      }
      
      // Approve - update item selections
      const allItems = await storage.getPOItemsByPOId(id);
      
      for (const item of allItems) {
        const isSelected = selectedItems.includes(item.id);
        await storage.updatePOItemSelection(item.id, isSelected);
      }
      
      // Recalculate total amount
      const selectedItemsData = allItems.filter(item => selectedItems.includes(item.id));
      const totalAmount = selectedItemsData.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0),
        0
      );
      
      // Generate cash flow description
      const itemDescriptions = selectedItemsData.map(item =>
        `${item.itemName} ${item.quantity} ${item.unit}(${Number(item.totalPrice).toLocaleString('id-ID')})`
      );
      const description = `pembelian ${itemDescriptions.join(' dan ')}`;
      
      // Create cash flow entry (using transactions table)
      const cashFlow = await storage.createTransaction({
        type: "pengeluaran",
        category: po.category,
        description,
        amount: totalAmount.toString(),
        status: "pending",
        createdBy: user.id,
        createdByTeam: "admin",
        transactionDate: new Date(),
      });
      
      // Update PO
      await storage.updatePurchaseOrder(id, {
        status: "approved_bendahara",
        totalAmount: totalAmount.toString(),
        reviewedByBendahara: user.id,
        reviewedByBendaharaAt: new Date(),
        cashFlowId: cashFlow.id,
      });
      
      res.json({
        success: true,
        message: "PO berhasil di-approve dan masuk ke cash flow",
        data: {
          poNumber: po.poNumber,
          status: "approved_bendahara",
          totalAmount,
          cashFlowId: cashFlow.id,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Approve by Ketua
  app.put("/api/po/:id/approve-ketua", authMiddleware, canApproveKetua, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      const { action, rejectionReason } = req.body;
      
      const po = await storage.getPurchaseOrderById(id);
      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase Order tidak ditemukan"
        });
      }
      
      if (po.status !== 'approved_bendahara') {
        return res.status(400).json({
          success: false,
          message: "PO harus di-approve bendahara terlebih dahulu"
        });
      }
      
      if (action === 'reject') {
        // Update PO
        await storage.updatePurchaseOrder(id, {
          status: "rejected",
          rejectedBy: user.id,
          rejectedAt: new Date(),
          rejectionReason,
        });
        
        // Update cash flow to rejected
        if (po.cashFlowId) {
          await storage.updateTransactionStatus(po.cashFlowId, 'rejected', user.id);
        }
        
        return res.json({
          success: true,
          message: "PO ditolak",
          data: {
            poNumber: po.poNumber,
            status: "rejected",
          },
        });
      }
      
      // Approve
      await storage.updatePurchaseOrder(id, {
        status: "approved_ketua",
        approvedByKetua: user.id,
        approvedByKetuaAt: new Date(),
      });
      
      // Update cash flow to approved
      if (po.cashFlowId) {
        await storage.updateTransactionStatus(po.cashFlowId, 'approved', user.id);
      }
      
      res.json({
        success: true,
        message: "PO berhasil di-approve ketua",
        data: {
          poNumber: po.poNumber,
          status: "approved_ketua",
          cashFlowUpdated: true,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete PO (only draft)
  app.delete("/api/po/:id", authMiddleware, async (req, res, next) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id);
      
      const po = await storage.getPurchaseOrderById(id);
      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase Order tidak ditemukan"
        });
      }
      
      // Check ownership
      if (po.createdBy !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat menghapus PO ini"
        });
      }
      
      // Can only delete draft
      if (po.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: "Hanya PO dengan status draft yang dapat dihapus"
        });
      }
      
      await storage.deletePurchaseOrder(id);
      
      res.json({
        success: true,
        message: "Purchase Order berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}


