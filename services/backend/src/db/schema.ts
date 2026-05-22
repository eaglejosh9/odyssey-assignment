import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Order status state machine.
 *
 *   pending → accepted → preparing → ready → completed
 *      ↓        ↓          ↓
 *      └────────┴──────────┴──→ cancelled
 *
 * Enforced server-side in src/services/orders.ts.
 */
export const orderStatusValues = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;

export const orderStatus = pgEnum("order_status", orderStatusValues);

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => menuCategories.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  available: boolean("available").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex("customers_email_unique")
      .on(t.email)
      .where(sql`${t.email} is not null`),
  })
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  status: orderStatus("status").notNull().default("pending"),
  subtotalCents: integer("subtotal_cents").notNull(),
  taxCents: integer("tax_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  notes: text("notes"),
  placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "restrict" }),
  // Snapshots so order history is immutable when the menu changes.
  nameSnapshot: text("name_snapshot").notNull(),
  priceSnapshotCents: integer("price_snapshot_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

/**
 * Singleton row (id=1). Enforced via insert in seed / first-write fallback.
 */
export const businessSettings = pgTable("business_settings", {
  id: integer("id").primaryKey().default(1),
  prepTimeMinutes: integer("prep_time_minutes").notNull().default(20),
  autoAccept: boolean("auto_accept").notNull().default(false),
  acceptingOrders: boolean("accepting_orders").notNull().default(true),
  taxRateBps: integer("tax_rate_bps").notNull().default(875), // 8.75%
  // { mon: { open: "09:00", close: "21:00", closed: false }, ... }
  openingHours: jsonb("opening_hours").$type<OpeningHours>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type OpeningHoursDay = {
  open: string;
  close: string;
  closed: boolean;
};
export type OpeningHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  OpeningHoursDay
>;
