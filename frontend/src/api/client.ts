import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";

export const api = axios.create({
  baseURL: baseURL || undefined,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "access_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
