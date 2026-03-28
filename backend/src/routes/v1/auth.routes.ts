import { Router } from "express";
import { Role } from "@prisma/client";
import {
  authenticate,
  requireRole,
  type AuthRequest,
} from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { loginSchema, registerSchema } from "../../validation/schemas.js";
import * as authService from "../../services/auth.service.js";

const r = Router();

r.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

r.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

r.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getUserById(req.userId!);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

/** Admin-only example endpoint */
r.get(
  "/admin/ping",
  authenticate,
  requireRole(Role.ADMIN),
  (_req, res) => {
    res.json({ success: true, data: { message: "admin ok" } });
  }
);

export const authRouter = r;
