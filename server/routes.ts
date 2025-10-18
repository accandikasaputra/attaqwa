import type { Express } from "express";
import { createServer, type Server } from "http";

// Import routes
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import donationRoutes from "./routes/donationRoutes";
import newsRoutes from "./routes/newsRoutes";
import bankAccountRoutes from "./routes/bankAccountRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import faqRoutes from "./routes/faqRoutes";
import statsRoutes from "./routes/statsRoutes";
import cashFlowRoutes from "./routes/cashFlowRoutes";
import poRoutes from "./routes/poRoutes";
import categoryRoutes from "./routes/categoryRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all routes
  app.use("/api/auth", authRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/donations", donationRoutes);
  app.use("/api/news", newsRoutes);
  app.use("/api/bank-accounts", bankAccountRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/faqs", faqRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/cashflow", cashFlowRoutes);
  app.use("/api/po", poRoutes);
  app.use("/api/categories", categoryRoutes);

  const httpServer = createServer(app);
  return httpServer;
}