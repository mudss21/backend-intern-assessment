# Backend Developer Intern — Assessment

Monorepo in this folder: **Express + TypeScript + PostgreSQL (Prisma)** API with **JWT auth**, **USER / ADMIN roles**, and **Tasks** CRUD under **`/api/v1`**, plus a **React (Vite)** UI for registration, login, and task management.

## Quick start

### 1. Database

** local PostgreSQL**  
Create a database named `assessment` and set `DATABASE_URL` in `backend/.env`.

### 2. Backend

```bash
cd backend
copy .env.example .env
# Edit .env if needed (JWT_SECRET, DATABASE_URL, CORS_ORIGIN)
npm install
npx prisma db push
npm run db:seed
npm run dev
```

- API: `http://localhost:4000`
- Health: `GET /health`
- Swagger UI: `http://localhost:4000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api`, `/docs`, and `/health` to the backend (see `frontend/vite.config.ts`). For a production build, set `VITE_API_BASE` to your API origin (e.g. `https://api.example.com`).

## Demo accounts (after seed)

| Email               | Password   | Role  |
|---------------------|------------|-------|
| admin@example.com   | Admin123!  | ADMIN |

Register new users via the UI or `POST /api/v1/auth/register` — they receive the **USER** role.

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register (USER) |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| GET | `/api/v1/auth/me` | JWT | Current user |
| GET | `/api/v1/auth/admin/ping` | JWT (ADMIN) | Admin-only check |
| GET/POST | `/api/v1/tasks` | JWT | List / create tasks |
| GET/PATCH/DELETE | `/api/v1/tasks/:id` | JWT | Read / update / delete |

- **USER**: sees and manages only their tasks.  
- **ADMIN**: list endpoint returns **all** tasks (with owner info); can access any task by id.

Responses use JSON: success payloads `{ success: true, data: ... }`; errors `{ success: false, error: { message, code } }`.

## Documentation

- **Swagger**: `http://localhost:4000/docs` (OpenAPI served from `swagger-jsdoc` + route annotations).
- **Postman**: import `postman/Assessment_API.postman_collection.json`. Run **Login** to save `accessToken` into the collection variable `token`.

## Security & validation

- Passwords hashed with **bcrypt** (cost 12).
- **JWT** in `Authorization: Bearer <token>`; short-lived configurable via `JWT_EXPIRES_IN`.
- Request bodies validated with **Zod**; strings trimmed and length-limited; emails normalized.
- **Helmet**, **CORS**, **rate limiting**, JSON body size limit.

## Scalability note

- **Stateless API**: JWT allows horizontal scaling behind a load balancer without server-side sessions.
- **Database**: Prisma connection pooling; add indexes (e.g. `Task.userId`) for list queries; read replicas for heavy read workloads.
- **Caching**: Optional **Redis** for hot reads (e.g. user profile), rate-limit counters, or idempotency keys — `docker-compose.yml` includes a commented Redis service as a starting point.
- **Evolution**: Split bounded contexts into services (auth, tasks) only when load and team size justify the operational cost; keep API versioning (`/api/v1`) for backward compatibility.
- **Deployment**: Containerize backend and frontend; use managed Postgres; centralize structured logging and metrics (request latency, error rates).

## Project layout

```
assessment/
  backend/          # API server
  frontend/         # React UI
  postman/          # Postman collection
  docker-compose.yml
  README.md
```

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| backend | `npm run dev` | Dev server with `tsx watch` |
| backend | `npm run build` / `npm start` | Production compile + run |
| backend | `npx prisma db push` | Sync schema to DB |
| backend | `npm run db:seed` | Seed admin user |
| frontend | `npm run dev` | Vite dev |
| frontend | `npm run build` | Production bundle |

## License

Assessment submission — internal use.
