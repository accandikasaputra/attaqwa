import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Selamat datang di dashboard admin",
    user: (req as any).user,
  });
});

export default router;
