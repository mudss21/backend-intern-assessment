import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { taskRouter } from "./task.routes.js";

const r = Router();

r.use("/auth", authRouter);
r.use("/tasks", taskRouter);

export const v1Router = r;
