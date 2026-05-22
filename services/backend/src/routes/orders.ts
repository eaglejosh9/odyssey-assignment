import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { AppEnv } from "../app-env";
import {
  ApiError,
  CreateOrderInput,
  OrderStatus,
  OrderWithItems,
  UpdateOrderStatusInput,
} from "../db/zod";
import { createOrder, getOrder, listOrders, updateOrderStatus } from "../services/orders";
import { errorResponse } from "./_helpers";

export const ordersRouter = new OpenAPIHono<AppEnv>();

const idParam = z.object({ id: z.coerce.number().int().positive() });

const listQuery = z.object({
  status: z
    .union([OrderStatus, z.array(OrderStatus)])
    .optional()
    .openapi({ description: "Filter by one or more statuses." }),
  customerId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

ordersRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Orders"],
    summary: "List orders with filters",
    request: { query: listQuery },
    responses: {
      200: {
        description: "Matching orders, newest first.",
        content: { "application/json": { schema: z.array(OrderWithItems) } },
      },
    },
  }),
  async (c) => {
    const q = c.req.valid("query");
    const statuses = q.status === undefined ? undefined : Array.isArray(q.status) ? q.status : [q.status];
    const rows = await listOrders(c.var.db, {
      status: statuses,
      customerId: q.customerId,
      limit: q.limit,
    });
    return c.json(rows, 200);
  }
);

ordersRouter.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Orders"],
    summary: "Get an order with items + customer",
    request: { params: idParam },
    responses: {
      200: { description: "Order", content: { "application/json": { schema: OrderWithItems } } },
      404: { description: "Not found", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const row = await getOrder(c.var.db, id);
      return c.json(row, 200);
    } catch (e) {
      return errorResponse(c, e);
    }
  }
);

ordersRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Orders"],
    summary: "Create an order. Totals computed server-side.",
    request: { body: { content: { "application/json": { schema: CreateOrderInput } }, required: true } },
    responses: {
      201: { description: "Created order with items.", content: { "application/json": { schema: OrderWithItems } } },
      400: { description: "Validation error", content: { "application/json": { schema: ApiError } } },
      404: { description: "Customer or item not found", content: { "application/json": { schema: ApiError } } },
      409: { description: "Item unavailable", content: { "application/json": { schema: ApiError } } },
      503: { description: "Not accepting orders", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    try {
      const created = await createOrder(c.var.db, c.req.valid("json"));
      return c.json(created, 201);
    } catch (e) {
      return errorResponse(c, e);
    }
  }
);

ordersRouter.openapi(
  createRoute({
    method: "patch",
    path: "/{id}/status",
    tags: ["Orders"],
    summary: "Advance an order through the state machine",
    request: {
      params: idParam,
      body: { content: { "application/json": { schema: UpdateOrderStatusInput } }, required: true },
    },
    responses: {
      200: { description: "Updated order.", content: { "application/json": { schema: OrderWithItems } } },
      404: { description: "Not found", content: { "application/json": { schema: ApiError } } },
      409: { description: "Invalid status transition", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { status } = c.req.valid("json");
    try {
      const updated = await updateOrderStatus(c.var.db, id, status);
      return c.json(updated, 200);
    } catch (e) {
      return errorResponse(c, e);
    }
  }
);
