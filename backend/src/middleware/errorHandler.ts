import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
  }

  console.error(err);
  const message =
    env.NODE_ENV === "production" ? "Internal server error" : String((err as Error).message);
  return res.status(500).json({
    success: false,
    error: { message, code: "INTERNAL_ERROR" },
  });
}
