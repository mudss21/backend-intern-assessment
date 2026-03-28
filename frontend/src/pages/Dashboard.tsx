import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import * as tasksApi from "../api/tasks";
import type { ApiErrorBody, Task, TaskStatus } from "../api/types";
import { Flash } from "../components/Flash";
import "./Dashboard.css";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await tasksApi.listTasks();
      setTasks(list);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const b = e.response.data as ApiErrorBody;
        setFlash({ type: "error", text: b.error?.message || "Failed to load tasks" });
      } else setFlash({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    try {
      await tasksApi.createTask({ title, description: description || undefined, status });
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setFlash({ type: "success", text: "Task created" });
      await load();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const b = e.response.data as ApiErrorBody;
        setFlash({ type: "error", text: b.error?.message || "Create failed" });
      } else setFlash({ type: "error", text: "Network error" });
    }
  }

  async function onStatusChange(id: string, s: TaskStatus) {
    setFlash(null);
    try {
      await tasksApi.updateTask(id, { status: s });
      setFlash({ type: "success", text: "Task updated" });
      await load();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const b = e.response.data as ApiErrorBody;
        setFlash({ type: "error", text: b.error?.message || "Update failed" });
      } else setFlash({ type: "error", text: "Network error" });
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    setFlash(null);
    try {
      await tasksApi.deleteTask(id);
      setFlash({ type: "success", text: "Task deleted" });
      await load();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const b = e.response.data as ApiErrorBody;
        setFlash({ type: "error", text: b.error?.message || "Delete failed" });
      } else setFlash({ type: "error", text: "Network error" });
    }
  }

  return (
    <div className="dash">
      <header className="dash__header">
        <div>
          <h1>Tasks</h1>
          <p className="dash__sub">
            Signed in as <strong>{user?.email}</strong>
            {user?.role === "ADMIN" && (
              <span className="badge">Admin — all tasks visible</span>
            )}
          </p>
        </div>
        <div className="dash__actions">
          <a className="link" href="/docs" target="_blank" rel="noreferrer">
            API docs
          </a>
          <button type="button" className="btn-ghost" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      {flash && (
        <Flash
          type={flash.type}
          message={flash.text}
          onDismiss={() => setFlash(null)}
        />
      )}

      <section className="panel">
        <h2>New task</h2>
        <form className="task-form" onSubmit={onCreate}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <button type="submit">Add task</button>
        </form>
      </section>

      <section className="panel">
        <h2>Your tasks {user?.role === "ADMIN" && "(all users)"}</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks yet.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((t) => (
              <li key={t.id} className="task-card">
                <div className="task-card__main">
                  <div className="task-card__title">{t.title}</div>
                  {t.description && (
                    <div className="task-card__desc">{t.description}</div>
                  )}
                  {t.user && user?.role === "ADMIN" && (
                    <div className="task-card__owner">
                      Owner: {t.user.email}
                    </div>
                  )}
                </div>
                <div className="task-card__controls">
                  <select
                    value={t.status}
                    onChange={(e) =>
                      onStatusChange(t.id, e.target.value as TaskStatus)
                    }
                    aria-label="Status"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => onDelete(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="dash__footer">
        <Link to="/login">Back to login</Link>
      </footer>
    </div>
  );
}
