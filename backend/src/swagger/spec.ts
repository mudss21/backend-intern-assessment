import swaggerJsdoc from "swagger-jsdoc";
import { env } from "../config/env.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Assessment API",
      version: "1.0.0",
      description:
        "REST API with JWT auth, roles, and tasks CRUD. Base path: /api/v1",
    },
    servers: [{ url: `http://localhost:${env.PORT}`, description: "Local" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [],
  },
  apis: [],
};

const generated = swaggerJsdoc(options) as Record<string, unknown>;

const manualPaths = {
  "/health": {
    get: {
      tags: ["System"],
      summary: "Health check",
      responses: { 200: { description: "OK" } },
    },
  },
  "/api/v1/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                name: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Created" },
        400: { description: "Validation error" },
        409: { description: "Email taken" },
      },
    },
  },
  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "JWT issued" },
        401: { description: "Invalid credentials" },
      },
    },
  },
  "/api/v1/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Current user",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "User" }, 401: { description: "Unauthorized" } },
    },
  },
  "/api/v1/auth/admin/ping": {
    get: {
      tags: ["Auth"],
      summary: "Admin-only",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "OK" }, 403: { description: "Forbidden" } },
    },
  },
  "/api/v1/tasks": {
    get: {
      tags: ["Tasks"],
      summary: "List tasks",
      description: "USER: own tasks. ADMIN: all tasks with owner.",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Task list" }, 401: { description: "Unauthorized" } },
    },
    post: {
      tags: ["Tasks"],
      summary: "Create task",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Created" }, 400: { description: "Validation error" } },
    },
  },
  "/api/v1/tasks/{id}": {
    get: {
      tags: ["Tasks"],
      summary: "Get task",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Task" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    },
    patch: {
      tags: ["Tasks"],
      summary: "Update task",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string", nullable: true },
                status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Updated" }, 403: { description: "Forbidden" }, 404: { description: "Not found" } },
    },
    delete: {
      tags: ["Tasks"],
      summary: "Delete task",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        204: { description: "Deleted" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    },
  },
};

export const swaggerSpec = {
  ...generated,
  paths: {
    ...(generated.paths as object),
    ...manualPaths,
  },
};
