import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { v1Router } from "./routes/v1/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { swaggerSpec } from "./swagger/spec.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 300 : 2000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: "v1" });
  });

  app.use("/api/v1", v1Router);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { message: "Not found", code: "NOT_FOUND" },
    });
  });

  app.use(errorHandler);

  return app;
}
