import { api } from "./client";
import type { Task, TaskStatus } from "./types";

export async function listTasks() {
  const { data } = await api.get<{ success: boolean; data: Task[] }>(
    "/api/v1/tasks"
  );
  return data.data;
}

export async function createTask(body: {
  title: string;
  description?: string;
  status?: TaskStatus;
}) {
  const { data } = await api.post<{ success: boolean; data: Task }>(
    "/api/v1/tasks",
    body
  );
  return data.data;
}

export async function updateTask(
  id: string,
  body: Partial<{ title: string; description: string | null; status: TaskStatus }>
) {
  const { data } = await api.patch<{ success: boolean; data: Task }>(
    `/api/v1/tasks/${id}`,
    body
  );
  return data.data;
}

export async function deleteTask(id: string) {
  await api.delete(`/api/v1/tasks/${id}`);
}
