import { desc, eq, sql } from "drizzle-orm";
import type { z } from "zod";
import type { DB } from "../db/client";
import { customers, orders } from "../db/schema";
import type { CustomerInsert, CustomerWithStats } from "../db/zod";
import { NotFoundError } from "./errors";

export async function listCustomersWithStats(db: DB): Promise<z.infer<typeof CustomerWithStats>[]> {
  const rows = await db
    .select({
      customer: customers,
      orderCount: sql<number>`count(${orders.id})::int`,
      lifetimeSpendCents: sql<number>`coalesce(sum(case when ${orders.status} != 'cancelled' then ${orders.totalCents} else 0 end), 0)::int`,
      lastOrderAt: sql<string | null>`max(${orders.placedAt})::text`,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(desc(sql`max(${orders.placedAt})`));

  return rows.map((r) => ({
    ...r.customer,
    orderCount: r.orderCount,
    lifetimeSpendCents: r.lifetimeSpendCents,
    lastOrderAt: r.lastOrderAt,
  }));
}

export async function getCustomerWithStats(
  db: DB,
  id: number
): Promise<z.infer<typeof CustomerWithStats>> {
  const [row] = await db
    .select({
      customer: customers,
      orderCount: sql<number>`count(${orders.id})::int`,
      lifetimeSpendCents: sql<number>`coalesce(sum(case when ${orders.status} != 'cancelled' then ${orders.totalCents} else 0 end), 0)::int`,
      lastOrderAt: sql<string | null>`max(${orders.placedAt})::text`,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(eq(customers.id, id))
    .groupBy(customers.id)
    .limit(1);

  if (!row) throw new NotFoundError("Customer", id);
  return {
    ...row.customer,
    orderCount: row.orderCount,
    lifetimeSpendCents: row.lifetimeSpendCents,
    lastOrderAt: row.lastOrderAt,
  };
}

export async function createCustomer(db: DB, input: z.infer<typeof CustomerInsert>) {
  const [created] = await db.insert(customers).values(input).returning();
  if (!created) throw new Error("Failed to insert customer");
  return created;
}
