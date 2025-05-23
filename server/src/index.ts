/***************************************************************
 * Express server for PCB board upload/validation challenge.
 * Implements authentication, board CRUD, and schema validation using Zod.
 ***************************************************************/

////////////////////////////////////////////////////////////////////
// --- Imports/Setup

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string };
    }
  }
}

const prisma = new PrismaClient();
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "devsecret123";
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

////////////////////////////////////////////////////////////////////
// --- Zod schema for Board JSON validation

const PinName = z.string().min(1);

const Component = z.object({
  name: z.string().min(1, "Component name can’t be blank"),
  pins: z.array(PinName).min(1, "Component must have at least one pin"),
});

const Net = z.object({
  name: z.string().min(1, "Net name can’t be blank"),
  pins: z.array(z.string().min(1)).min(1, "Net must connect at least one pin"),
});

const BoardSchema = z.object({
  name: z.string().min(1),
  components: z.array(Component).min(1),
  nets: z.array(Net).min(1),
});

////////////////////////////////////////////////////////////////////
// --- Middleware

/**
 * Authentication middleware that verifies JWT token from Authorization header.
 * On success, attaches user info (id and email) to req.user.
 * On failure, returns 401 Unauthorized.
 */
function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ error: "No token" });
    return;
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") {
      res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded as { id: number; email: string };
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
}

////////////////////////////////////////////////////////////////////
// --- Auth Endpoints

/**
 * POST /api/auth/signup
 * Registers a new user with email and password.
 * Responds with a JWT token on success.
 * Returns 400 if email or password missing.
 * Returns 409 if email already exists.
 */
app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    res.status(400).json({ error: "Email and password required" });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) res.status(409).json({ error: "Email already in use" });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash } });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token });
});

/**
 * POST /api/auth/login
 * Authenticates user with email and password.
 * Responds with JWT token on success.
 * Returns 401 if credentials are invalid.
 */
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ id: user!.id, email: user!.email }, JWT_SECRET);
  res.json({ token });
});

////////////////////////////////////////////////////////////////////
// --- Board Endpoints

/**
 * GET /api/boards
 * Retrieves all boards belonging to the authenticated user.
 * Returns boards sorted by creation date descending.
 */
app.get("/api/boards", auth, async (req: Request, res: Response) => {
  const boards = await prisma.board.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(
    boards.map((b: any) => ({ id: b.id, name: b.name, createdAt: b.createdAt }))
  );
});

/**
 * GET /api/boards/:id
 * Retrieves detailed information about a specific board by ID.
 * Validates the board JSON and returns validation issues if any.
 * Returns 404 if board not found or does not belong to user.
 */
app.get("/api/boards/:id", auth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const board = await prisma.board.findUnique({ where: { id } });
  if (!board || board.userId !== req.user!.id) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const boardJson = JSON.parse(board.json);
  const validation = validateBoardJson(boardJson);
  res.json({
    id: board.id,
    name: board.name,
    json: boardJson,
    createdAt: board.createdAt,
    validation,
  });
});

/**
 * POST /api/boards
 * Uploads a new board JSON.
 * Stores the board JSON as a string in the database.
 * Uses the name from the JSON if available, otherwise uses a fallback timestamped name.
 * Validation is not enforced before saving.
 */
app.post("/api/boards", auth, async (req: Request, res: Response) => {
  let boardJson = req.body.json ?? req.body;
  // Persist as string (for SQLite); always store, even if invalid or not JSON
  let name =
    req.body.name ?? "Board file uploaded at " + new Date().toISOString();
  // If boardJson is an object and has a string 'name' property, use it as the board name
  if (
    boardJson &&
    typeof boardJson === "object" &&
    boardJson !== null &&
    "name" in boardJson &&
    typeof boardJson.name === "string"
  ) {
    name = boardJson.name;
  }
  const board = await prisma.board.create({
    data: {
      name,
      json: JSON.stringify(boardJson),
      userId: req.user!.id,
    },
  });
  res.status(201).json({
    id: board.id,
    name,
  });
});

////////////////////////////////////////////////////////////////////
// --- Validation

/**
 * Validates board JSON against the BoardSchema Zod schema.
 * Returns an array of validation error messages if any, or empty array if valid.
 */
function validateBoardJson(boardJson: any): string[] {
  const result = BoardSchema.safeParse(boardJson);

  if (result.success) {
    return []; // No validation issues
  } else {
    return result.error.issues.map((issue) => {
      // Show path to error, e.g. "components[2].pins"
      const path = issue.path.length ? issue.path.join(".") : "(root)";
      return `[${path}] ${issue.message}`;
    });
  }
}

////////////////////////////////////////////////////////////////////
// --- Server Start

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
