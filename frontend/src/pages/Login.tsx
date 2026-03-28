import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Flash } from "../components/Flash";
import type { ApiErrorBody } from "../api/types";
import "./AuthPage.css";

export function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav("/dashboard", { replace: true });
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const b = e.response.data as ApiErrorBody;
        setErr(b.error?.message || "Login failed");
      } else setErr("Network error");
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1>Sign in</h1>
        <p className="auth__hint">JWT-protected dashboard and tasks API.</p>
        {err && (
          <Flash type="error" message={err} onDismiss={() => setErr(null)} />
        )}
        <form onSubmit={onSubmit} className="auth__form">
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Log in</button>
        </form>
        <p className="auth__footer">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
