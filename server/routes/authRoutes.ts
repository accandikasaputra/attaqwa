import express, { Request, Response, NextFunction } from "express";
import passport from "../auth";
import { generateToken } from "../auth";

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login user dan menghasilkan JWT
 */
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Email atau password salah.",
      });
    }

    try {
      const token = generateToken(user);
      console.log("JWT token generated:", token);


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
      return res.status(500).json({ success: false, message: "Gagal menghasilkan token." });
    }
  })(req, res, next);
});

export default router;
