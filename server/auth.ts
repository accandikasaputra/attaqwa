import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User } from "@shared/schema";

// =====================
// 🔹 JWT Helper
// =====================
export function generateToken(user: any): string {
  const secret = process.env.JWT_SECRET || "supersecretkey";
  const options: SignOptions = { expiresIn: "7d" };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    options
  );
}


// =====================
// 🔹 Passport Local Strategy
// =====================
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      console.log("🔥 Passport LocalStrategy triggered:", email, password);

      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          console.log("✅ Password salah:", email);
          return done(null, false, { message: "Email tidak ditemukan" });
        }
        if (user.isActive === 0) {
          console.log("✅ Password salah:", user.email);
          return done(null, false, { message: "Akun tidak aktif" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log("✅ Password salah:", user.email);
          return done(null, false, { message: "Password salah" });
        }
        console.log("✅ Login sukses:", user.email);
        return done(null, user);
        
      } catch (error) {
        return done(error);
      }
    }
  )
);

// =====================
// 🔹 Serialize / Deserialize
// =====================
passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) return done(new Error("User not found"));

    const { password, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  } catch (error) {
    done(error);
  }
});

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


export default passport;
