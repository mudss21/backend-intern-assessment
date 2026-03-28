import { Router } from "express";
import { authenticate, type AuthRequest } from "../../middleware/auth.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import {
  idParamSchema,
  taskCreateSchema,
  taskUpdateSchema,
} from "../../validation/schemas.js";
import * as taskService from "../../services/task.service.js";

const r = Router();

r.use(authenticate);

r.get("/", async (req: AuthRequest, res, next) => {
  try {
    const tasks = await taskService.listTasks(req.userId!, req.role!);
    res.json({ success: true, data: tasks });
  } catch (e) {
    next(e);
  }
});

r.post("/", validateBody(taskCreateSchema), async (req: AuthRequest, res, next) => {
  try {
    const task = await taskService.createTask(req.userId!, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
});

r.get(
  "/:id",
  validateParams(idParamSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params as { id: string };
      const task = await taskService.getTaskById(id, req.userId!, req.role!);
      res.json({ success: true, data: task });
    } catch (e) {
      next(e);
    }
  }
);

r.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(taskUpdateSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params as { id: string };
      const task = await taskService.updateTask(
        id,
        req.userId!,
        req.role!,
        req.body
      );
      res.json({ success: true, data: task });
    } catch (e) {
      next(e);
    }
  }
);

r.delete(
  "/:id",
  validateParams(idParamSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params as { id: string };
      await taskService.deleteTask(id, req.userId!, req.role!);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export const taskRouter = r;
