import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { AppEnv } from "../app-env";
import {
  ApiError,
  MenuCategoryInsert,
  MenuCategorySelect,
  MenuItemInsert,
  MenuItemSelect,
  MenuItemUpdate,
} from "../db/zod";
import {
  createCategory,
  createItem,
  deleteItem,
  listCategories,
  listItems,
  updateItem,
} from "../services/menu";
import { errorResponse } from "./_helpers";

export const menuRouter = new OpenAPIHono<AppEnv>();

const idParam = z.object({ id: z.coerce.number().int().positive() });

menuRouter.openapi(
  createRoute({
    method: "get",
    path: "/categories",
    tags: ["Menu"],
    summary: "List menu categories",
    responses: {
      200: {
        description: "Categories ordered by sort_order then id.",
        content: { "application/json": { schema: z.array(MenuCategorySelect) } },
      },
    },
  }),
  async (c) => {
    const rows = await listCategories(c.var.db);
    return c.json(rows, 200);
  }
);

menuRouter.openapi(
  createRoute({
    method: "post",
    path: "/categories",
    tags: ["Menu"],
    summary: "Create a menu category",
    request: {
      body: { content: { "application/json": { schema: MenuCategoryInsert } }, required: true },
    },
    responses: {
      201: { description: "Created", content: { "application/json": { schema: MenuCategorySelect } } },
      400: { description: "Validation error", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const created = await createCategory(c.var.db, body);
    return c.json(created, 201);
  }
);

menuRouter.openapi(
  createRoute({
    method: "get",
    path: "/items",
    tags: ["Menu"],
    summary: "List menu items",
    responses: {
      200: {
        description: "All menu items.",
        content: { "application/json": { schema: z.array(MenuItemSelect) } },
      },
    },
  }),
  async (c) => {
    const rows = await listItems(c.var.db);
    return c.json(rows, 200);
  }
);

menuRouter.openapi(
  createRoute({
    method: "post",
    path: "/items",
    tags: ["Menu"],
    summary: "Create a menu item",
    request: {
      body: { content: { "application/json": { schema: MenuItemInsert } }, required: true },
    },
    responses: {
      201: { description: "Created", content: { "application/json": { schema: MenuItemSelect } } },
      400: { description: "Validation error", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const created = await createItem(c.var.db, body);
    return c.json(created, 201);
  }
);

menuRouter.openapi(
  createRoute({
    method: "patch",
    path: "/items/{id}",
    tags: ["Menu"],
    summary: "Update a menu item (e.g. toggle availability, change price)",
    request: {
      params: idParam,
      body: { content: { "application/json": { schema: MenuItemUpdate } }, required: true },
    },
    responses: {
      200: { description: "Updated", content: { "application/json": { schema: MenuItemSelect } } },
      404: { description: "Not found", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    try {
      const updated = await updateItem(c.var.db, id, body);
      return c.json(updated, 200);
    } catch (e) {
      return errorResponse(c, e);
    }
  }
);

menuRouter.openapi(
  createRoute({
    method: "delete",
    path: "/items/{id}",
    tags: ["Menu"],
    summary: "Delete a menu item",
    request: { params: idParam },
    responses: {
      204: { description: "Deleted" },
      404: { description: "Not found", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      await deleteItem(c.var.db, id);
      return c.body(null, 204);
    } catch (e) {
      return errorResponse(c, e);
    }
  }
);
