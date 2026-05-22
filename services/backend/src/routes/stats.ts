import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { AppEnv } from "../app-env";
import { HomeStats } from "../db/zod";
import { homeStats } from "../services/orders";

export const statsRouter = new OpenAPIHono<AppEnv>();

statsRouter.openapi(
  createRoute({
    method: "get",
    path: "/home",
    tags: ["Stats"],
    summary: "Aggregate KPIs for the dashboard Home page",
    responses: {
      200: { description: "Home stats", content: { "application/json": { schema: HomeStats } } },
    },
  }),
  async (c) => {
    const stats = await homeStats(c.var.db);
    return c.json(stats, 200);
  }
);
