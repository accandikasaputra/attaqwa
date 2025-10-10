import express from "express";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";

export async function registerRoutes(app: express.Express) {
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  return app;
}
