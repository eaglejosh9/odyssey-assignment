import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { AppEnv } from "../app-env";
import { ApiError, CustomerInsert, CustomerSelect, CustomerWithStats } from "../db/zod";
import { createCustomer, getCustomerWithStats, listCustomersWithStats } from "../services/customers";
import { listOrders } from "../services/orders";
import { OrderWithItems } from "../db/zod";
import { errorResponse } from "./_helpers";

export const customersRouter = new OpenAPIHono<AppEnv>();

const idParam = z.object({ id: z.coerce.number().int().positive() });

customersRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Customers"],
    summary: "List customers with aggregate stats",
    responses: {
      200: {
        description: "Customers with order_count, lifetime_spend_cents, last_order_at.",
        content: { "application/json": { schema: z.array(CustomerWithStats) } },
      },
    },
  }),
  async (c) => {
    const rows = await listCustomersWithStats(c.var.db);
    return c.json(rows, 200);
  }
);

customersRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Customers"],
    summary: "Create a customer",
    request: { body: { content: { "application/json": { schema: CustomerInsert } }, required: true } },
    responses: {
      201: { description: "Created", content: { "application/json": { schema: CustomerSelect } } },
      400: { description: "Validation error", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const created = await createCustomer(c.var.db, c.req.valid("json"));
    return c.json(created, 201);
  }
);

customersRouter.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Customers"],
    summary: "Get a customer with stats",
    request: { params: idParam },
    responses: {
      200: { description: "Customer", content: { "application/json": { schema: CustomerWithStats } } },
      404: { description: "Not found", content: { "application/json": { schema: ApiError } } },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const row = await getCustomerWithStats(c.var.db, id);
      return c.json(row, 200);
    } catch (e) {
      return errorResponse(c, e);
    }
  }
);

customersRouter.openapi(
  createRoute({
    method: "get",
    path: "/{id}/orders",
    tags: ["Customers"],
    summary: "List orders for a customer",
    request: { params: idParam },
    responses: {
      200: {
        description: "Orders sorted by placed_at desc.",
        content: { "application/json": { schema: z.array(OrderWithItems) } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const rows = await listOrders(c.var.db, { customerId: id });
    return c.json(rows, 200);
  }
);
