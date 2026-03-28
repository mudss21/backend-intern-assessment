import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { cleanText, normalizeEmail } from "../utils/sanitize.js";

const SALT_ROUNDS = 12;

export type AccessTokenPayload = { sub: string; role: Role };

export async function register(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = normalizeEmail(data.email);
  if (!email) throw new HttpError(400, "Invalid email", "INVALID_EMAIL");

  const password = cleanText(data.password, 128);
  if (password.length < 8)
    throw new HttpError(400, "Password must be at least 8 characters", "WEAK_PASSWORD");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "Email already registered", "EMAIL_TAKEN");

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const name = data.name ? cleanText(data.name, 200) : undefined;

  const user = await prisma.user.create({
    data: { email, password: hash, name, role: Role.USER },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, role: user.role });
  return { user, accessToken: token };
}

export async function login(data: { email: string; password: string }) {
  const email = normalizeEmail(data.email);
  if (!email) throw new HttpError(400, "Invalid email", "INVALID_EMAIL");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(401, "Invalid credentials", "INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(cleanText(data.password, 128), user.password);
  if (!ok) throw new HttpError(401, "Invalid credentials", "INVALID_CREDENTIALS");

  const safe = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
  const token = signToken({ sub: user.id, role: user.role });
  return { user: safe, accessToken: token };
}

export function signToken(payload: AccessTokenPayload): string {
  return jwt.sign(
    { sub: payload.sub, role: payload.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );
}

export function verifyToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role: Role;
    };
    if (!decoded.sub || !decoded.role)
      throw new HttpError(401, "Invalid token", "INVALID_TOKEN");
    return { sub: decoded.sub, role: decoded.role as Role };
  } catch {
    throw new HttpError(401, "Invalid or expired token", "INVALID_TOKEN");
  }
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw new HttpError(404, "User not found", "NOT_FOUND");
  return user;
}
