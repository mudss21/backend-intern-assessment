import { Role, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { cleanOptionalText, cleanText } from "../utils/sanitize.js";

function canAccessTask(
  ownerId: string,
  requesterId: string,
  requesterRole: Role
): boolean {
  if (requesterRole === Role.ADMIN) return true;
  return ownerId === requesterId;
}

export async function listTasks(userId: string, role: Role) {
  if (role === Role.ADMIN) {
    return prisma.task.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }
  return prisma.task.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createTask(
  userId: string,
  data: { title: string; description?: string; status?: TaskStatus }
) {
  const title = cleanText(data.title, 500);
  if (!title) throw new HttpError(400, "Title is required", "VALIDATION_ERROR");

  return prisma.task.create({
    data: {
      title,
      description: cleanOptionalText(data.description, 5000),
      status: data.status ?? TaskStatus.TODO,
      userId,
    },
  });
}

export async function getTaskById(
  id: string,
  requesterId: string,
  requesterRole: Role
) {
  const task = await prisma.task.findUnique({
    where: { id },
    include:
      requesterRole === Role.ADMIN
        ? { user: { select: { id: true, email: true, name: true } } }
        : undefined,
  });
  if (!task) throw new HttpError(404, "Task not found", "NOT_FOUND");
  if (!canAccessTask(task.userId, requesterId, requesterRole))
    throw new HttpError(403, "Forbidden", "FORBIDDEN");
  return task;
}

export async function updateTask(
  id: string,
  requesterId: string,
  requesterRole: Role,
  data: { title?: string; description?: string; status?: TaskStatus }
) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new HttpError(404, "Task not found", "NOT_FOUND");
  if (!canAccessTask(task.userId, requesterId, requesterRole))
    throw new HttpError(403, "Forbidden", "FORBIDDEN");

  const update: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
  } = {};
  if (data.title !== undefined) {
    const t = cleanText(data.title, 500);
    if (!t) throw new HttpError(400, "Title cannot be empty", "VALIDATION_ERROR");
    update.title = t;
  }
  if (data.description !== undefined)
    update.description = cleanOptionalText(data.description, 5000) ?? null;
  if (data.status !== undefined) update.status = data.status;

  return prisma.task.update({
    where: { id },
    data: update,
  });
}

export async function deleteTask(
  id: string,
  requesterId: string,
  requesterRole: Role
) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new HttpError(404, "Task not found", "NOT_FOUND");
  if (!canAccessTask(task.userId, requesterId, requesterRole))
    throw new HttpError(403, "Forbidden", "FORBIDDEN");

  await prisma.task.delete({ where: { id } });
}
