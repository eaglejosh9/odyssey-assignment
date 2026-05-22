import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import type { z } from "zod";
import type { DB } from "../db/client";
import {
  customers as customersTable,
  menuItems,
  orderItems,
  orders,
} from "../db/schema";
import type {
  CreateOrderInput,
  OrderStatus,
  OrderStatusAction,
  OrderWithItems,
} from "../db/zod";
import { ConflictError, NotFoundError, ServiceUnavailableError, ValidationError } from "./errors";
import { InvalidStatusTransitionError, canTransition } from "./order-status";
import { computeTotals } from "./totals";
import { loadSettings } from "./settings";

export type OrdersListFilter = {
  status?: ReadonlyArray<OrderStatus>;
  customerId?: number;
  since?: Date;
  until?: Date;
  limit?: number;
};

export async function listOrders(db: DB, filter: OrdersListFilter = {}) {
  const conditions = [];
  if (filter.status && filter.status.length > 0) {
    conditions.push(inArray(orders.status, filter.status as OrderStatus[]));
  }
  if (filter.customerId) conditions.push(eq(orders.customerId, filter.customerId));
  if (filter.since) conditions.push(gte(orders.placedAt, filter.since));
  if (filter.until) conditions.push(lt(orders.placedAt, filter.until));

  const rows = await db
    .select({
      order: orders,
      customer: customersTable,
    })
    .from(orders)
    .innerJoin(customersTable, eq(orders.customerId, customersTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.placedAt))
    .limit(filter.limit ?? 100);

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.order.id);
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, ids));
  const byOrder = new Map<number, typeof items>();
  for (const item of items) {
    const list = byOrder.get(item.orderId) ?? [];
    list.push(item);
    byOrder.set(item.orderId, list);
  }

  return rows.map((r) => ({
    ...r.order,
    customer: r.customer,
    items: byOrder.get(r.order.id) ?? [],
  })) satisfies z.infer<typeof OrderWithItems>[];
}

export async function getOrder(db: DB, id: number): Promise<z.infer<typeof OrderWithItems>> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) throw new NotFoundError("Order", id);

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, order.customerId))
    .limit(1);
  if (!customer) throw new NotFoundError("Customer", order.customerId);

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  return { ...order, customer, items };
}

export async function createOrder(
  db: DB,
  input: z.infer<typeof CreateOrderInput>
): Promise<z.infer<typeof OrderWithItems>> {
  const settings = await loadSettings(db);
  if (!settings.acceptingOrders) {
    throw new ServiceUnavailableError(
      "The restaurant is not currently accepting orders.",
      "NOT_ACCEPTING_ORDERS"
    );
  }

  // Validate customer exists.
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, input.customerId))
    .limit(1);
  if (!customer) throw new NotFoundError("Customer", input.customerId);

  // Validate items exist and are available.
  const requestedIds = Array.from(new Set(input.items.map((i) => i.menuItemId)));
  const fetchedItems = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, requestedIds));

  const itemById = new Map(fetchedItems.map((i) => [i.id, i]));
  const missing = requestedIds.filter((id) => !itemById.has(id));
  if (missing.length > 0) {
    throw new ValidationError(`Menu items not found: ${missing.join(", ")}`, { missing });
  }
  const unavailable = fetchedItems.filter((i) => !i.available).map((i) => i.id);
  if (unavailable.length > 0) {
    throw new ConflictError(
      `Menu items are not currently available: ${unavailable.join(", ")}`,
      "ITEM_UNAVAILABLE"
    );
  }

  // Snapshot lines and compute totals server-side.
  const lineSnapshots = input.items.map((line) => {
    const item = itemById.get(line.menuItemId)!;
    return {
      menuItemId: item.id,
      nameSnapshot: item.name,
      priceSnapshotCents: item.priceCents,
      quantity: line.quantity,
    };
  });

  const totals = computeTotals(
    lineSnapshots.map((l) => ({ priceCents: l.priceSnapshotCents, quantity: l.quantity })),
    settings.taxRateBps
  );

  const initialStatus: OrderStatus = settings.autoAccept ? "accepted" : "pending";

  // Insert order then items. (Neon HTTP driver is statement-scoped — not a true
  // transaction. For this assignment we accept best-effort consistency and rely
  // on FK constraints to keep the model coherent.)
  const [insertedOrder] = await db
    .insert(orders)
    .values({
      customerId: input.customerId,
      status: initialStatus,
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      notes: input.notes ?? null,
    })
    .returning();
  if (!insertedOrder) throw new Error("Failed to insert order");

  await db
    .insert(orderItems)
    .values(lineSnapshots.map((l) => ({ ...l, orderId: insertedOrder.id })));

  return getOrder(db, insertedOrder.id);
}

export async function updateOrderStatus(
  db: DB,
  id: number,
  next: z.infer<typeof OrderStatusAction>
): Promise<z.infer<typeof OrderWithItems>> {
  const [current] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!current) throw new NotFoundError("Order", id);
  if (!canTransition(current.status, next)) {
    throw new InvalidStatusTransitionError(current.status, next);
  }
  await db.update(orders).set({ status: next }).where(eq(orders.id, id));
  return getOrder(db, id);
}

export async function homeStats(db: DB) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayOrders = await db
    .select()
    .from(orders)
    .where(gte(orders.placedAt, startOfDay));

  const totalOrdersToday = todayOrders.length;
  const revenueTodayCents = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.totalCents, 0);
  const pendingOrders = todayOrders.filter((o) => o.status === "pending").length;
  const inProgressOrders = todayOrders.filter(
    (o) => o.status === "accepted" || o.status === "preparing" || o.status === "ready"
  ).length;
  const completedOrdersToday = todayOrders.filter((o) => o.status === "completed").length;
  const completed = todayOrders.filter((o) => o.status !== "cancelled");
  const averageOrderValueCents =
    completed.length > 0
      ? Math.round(completed.reduce((a, o) => a + o.totalCents, 0) / completed.length)
      : 0;

  // Popular items (last 30 days).
  const popularSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const popularRows = await db
    .select({
      menuItemId: orderItems.menuItemId,
      name: orderItems.nameSnapshot,
      soldCount: sql<number>`sum(${orderItems.quantity})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(gte(orders.placedAt, popularSince), sql`${orders.status} != 'cancelled'`))
    .groupBy(orderItems.menuItemId, orderItems.nameSnapshot)
    .orderBy(sql`sum(${orderItems.quantity}) desc`)
    .limit(5);

  return {
    totalOrdersToday,
    revenueTodayCents,
    pendingOrders,
    inProgressOrders,
    completedOrdersToday,
    averageOrderValueCents,
    popularItems: popularRows,
  };
}
