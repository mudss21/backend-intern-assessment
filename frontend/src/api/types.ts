export type Role = "USER" | "ADMIN";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; name: string | null };
};

export type ApiErrorBody = {
  success: false;
  error: { message: string; code?: string };
};
