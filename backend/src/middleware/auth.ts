import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../services/auth.service.js";
import { HttpError } from "../utils/httpError.js";

export type AuthRequest = Request & {
  userId?: string;
  role?: Role;
};

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return next(new HttpError(401, "Missing or invalid Authorization header", "UNAUTHORIZED"));

  const token = header.slice(7).trim();
  if (!token) return next(new HttpError(401, "Missing token", "UNAUTHORIZED"));

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.role = payload.role;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role))
      return next(new HttpError(403, "Insufficient permissions", "FORBIDDEN"));
    next();
  };
}
