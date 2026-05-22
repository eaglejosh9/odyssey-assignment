import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { AppEnv } from "./app-env";
import { createDb } from "./db/client";
import { customersRouter } from "./routes/customers";
import { menuRouter } from "./routes/menu";
import { ordersRouter } from "./routes/orders";
import { settingsRouter } from "./routes/settings";
import { statsRouter } from "./routes/stats";

export function createApp() {
  const app = new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: "Request validation failed",
            code: "VALIDATION_ERROR",
            details: result.error.flatten(),
          },
          400
        );
      }
    },
  });

  app.use("*", logger());
  app.use(
    "*",
    cors({
      origin: (origin) => origin ?? "*",
      allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["content-type", "authorization"],
      credentials: true,
    })
  );

  // Attach a per-request Drizzle client bound to the worker binding.
  // Skipped for static endpoints (health, openapi doc) that don't need the DB.
  app.use("*", async (c, next) => {
    if (c.req.path === "/health" || c.req.path === "/openapi.json") {
      return next();
    }
    const url = c.env.DATABASE_URL;
    if (!url) {
      return c.json(
        { error: "Server misconfigured: DATABASE_URL is not set.", code: "MISCONFIGURED" },
        500
      );
    }
    c.set("db", createDb(url));
    await next();
  });

  app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

  app.route("/menu", menuRouter);
  app.route("/orders", ordersRouter);
  app.route("/customers", customersRouter);
  app.route("/settings", settingsRouter);
  app.route("/stats", statsRouter);

  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "Odyssey Restaurant API",
      version: "0.1.0",
      description: "Hono + Drizzle + Neon. Schemas generated from drizzle-zod.",
    },
    servers: [{ url: "http://localhost:8787", description: "Local dev" }],
  });

  app.onError((err, c) => {
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal Server Error", code: "INTERNAL" }, 500);
  });

  return app;
}
