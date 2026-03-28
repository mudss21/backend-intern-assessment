import { api, setToken } from "./client";
import type { User } from "./types";

export async function register(body: {
  email: string;
  password: string;
  name?: string;
}) {
  const { data } = await api.post<{
    success: boolean;
    data: { user: User; accessToken: string };
  }>("/api/v1/auth/register", body);
  setToken(data.data.accessToken);
  return data.data;
}

export async function login(body: { email: string; password: string }) {
  const { data } = await api.post<{
    success: boolean;
    data: { user: User; accessToken: string };
  }>("/api/v1/auth/login", body);
  setToken(data.data.accessToken);
  return data.data;
}

export function logout() {
  setToken(null);
}

export async function fetchMe() {
  const { data } = await api.get<{ success: boolean; data: User }>(
    "/api/v1/auth/me"
  );
  return data.data;
}
