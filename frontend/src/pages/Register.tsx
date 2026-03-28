import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Flash } from "../components/Flash";
import type { ApiErrorBody } from "../api/types";
import "./AuthPage.css";

export function Register() {
  const { register, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    try {
      await register(email, password, name || undefined);
      setOk("Account created. Redirecting…");
      setTimeout(() => nav("/dashboard", { replace: true }), 400);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const b = e.response.data as ApiErrorBody;
        setErr(b.error?.message || "Registration failed");
      } else setErr("Network error");
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1>Create account</h1>
        <p className="auth__hint">New users get the USER role.</p>
        {err && (
          <Flash type="error" message={err} onDismiss={() => setErr(null)} />
        )}
        {ok && (
          <Flash type="success" message={ok} onDismiss={() => setOk(null)} />
        )}
        <form onSubmit={onSubmit} className="auth__form">
          <label>
            Name <span className="optional">(optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
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
            Password <span className="optional">min 8 chars</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <button type="submit">Register</button>
        </form>
        <p className="auth__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
