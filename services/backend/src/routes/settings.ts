import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { AppEnv } from "../app-env";
import { ApiError, BusinessSettingsSelect, BusinessSettingsUpdate } from "../db/zod";
import { loadSettings, updateSettings } from "../services/settings";

export const settingsRouter = new OpenAPIHono<AppEnv>();

settingsRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Settings"],
    summary: "Get business settings",
    responses: {
      200: { description: "Settings", content: { "application/json": { schema: BusinessSettingsSelect } } },
    },
  }),
  async (c) => {
    const row = await loadSettings(c.var.db);
    return c.json(row, 200);
  }
);

settingsRouter.openapi(
  createRoute({
    method: "patch",
    path: "/",
    tags: ["Settings"],
    summary: "Update business settings",
    request: {
      body: { content: { "application/json": { schema: BusinessSettingsUpdate } }, required: true },
    },
    responses: {
      200: { description: "Updated settings", content: { "application/json": { schema: BusinessSettingsSelect } } },
      400: { description: "Validation error", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const updated = await updateSettings(c.var.db, body);
    return c.json(updated, 200);
  }
);
