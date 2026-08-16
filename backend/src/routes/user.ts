import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, sql } from "../db/index.js";
import { users } from "../db/schema.js";
import { signupSchema, loginSchema } from "../validation/user.js";

export const userRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "sportz_dashboard_secret_jwt_key_2026";

// Helper to ensure users table exists in PostgreSQL
let tableEnsured = false;
async function ensureUsersTable() {
  if (tableEnsured) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        favorite_sport TEXT DEFAULT 'Football',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    tableEnsured = true;
  } catch (err) {
    console.error("Failed to ensure users table in PostgreSQL:", err);
  }
}


// POST /api/users/signup
userRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    await ensureUsersTable();

    const parsed = await signupSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        detail: parsed.error.issues,
      });
    }

    const { name, email, password, favoriteSport } = parsed.data;

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: "An account with this email address already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        favoriteSport: favoriteSport || "Football",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        favoriteSport: users.favoriteSport,
        createdAt: users.createdAt,
      });

    // Sign JWT
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error during registration",
    });
  }
});


// POST /api/users/login
userRouter.post("/login", async (req: Request, res: Response) => {
  try {
    await ensureUsersTable();

    const parsed = await loginSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        detail: parsed.error.issues,
      });
    }

    const { email, password } = parsed.data;

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        favoriteSport: user.favoriteSport,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Internal server error during login",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET /api/users/me
userRouter.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        favoriteSport: users.favoriteSport,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ data: user });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default userRouter;
