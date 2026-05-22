/**
 * drizzle-zod adapters. These are the *single source of truth* for API zod schemas.
 * They are consumed by the OpenAPI routes in src/routes/* and the resulting OpenAPI
 * document drives Orval code-gen for the frontend.
 */
// Important: import @hono/zod-openapi BEFORE any schema creation so its
// .openapi() prototype extension is applied to zod globally. drizzle-zod
// returns standard zod schemas, which inherit the extension via the prototype.
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  businessSettings,
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orders,
  orderStatusValues,
} from "./schema";

// --- Enums --------------------------------------------------------------
export const OrderStatus = z.enum(orderStatusValues).openapi("OrderStatus");
export type OrderStatus = z.infer<typeof OrderStatus>;

// --- Menu category ------------------------------------------------------
export const MenuCategorySelect = createSelectSchema(menuCategories).openapi("MenuCategory");

export const MenuCategoryInsert = createInsertSchema(menuCategories, {
  name: z.string().min(1).max(80),
  sortOrder: z.number().int().min(0).optional(),
})
  .omit({ id: true, createdAt: true })
  .openapi("MenuCategoryInput");

// --- Menu item ----------------------------------------------------------
export const MenuItemSelect = createSelectSchema(menuItems, {
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
}).openapi("MenuItem");

export const MenuItemInsert = createInsertSchema(menuItems, {
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  priceCents: z.number().int().min(0).max(1_000_000),
  imageUrl: z.string().url().nullable().optional(),
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .openapi("MenuItemInput");

export const MenuItemUpdate = MenuItemInsert.partial().openapi("MenuItemUpdate");

// --- Customer -----------------------------------------------------------
export const CustomerSelect = createSelectSchema(customers, {
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
}).openapi("Customer");

export const CustomerInsert = createInsertSchema(customers, {
  name: z.string().min(1).max(120),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(5).max(40).nullable().optional(),
})
  .omit({ id: true, createdAt: true })
  .openapi("CustomerInput");

// --- Orders -------------------------------------------------------------
export const OrderSelect = createSelectSchema(orders).openapi("Order");

export const OrderItemSelect = createSelectSchema(orderItems).openapi("OrderItem");

export const OrderWithItems = OrderSelect.extend({
  customer: CustomerSelect,
  items: z.array(OrderItemSelect),
}).openapi("OrderWithItems");

export const OrderItemInput = z
  .object({
    menuItemId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
  })
  .openapi("OrderItemInput");

export const CreateOrderInput = z
  .object({
    customerId: z.number().int().positive(),
    items: z.array(OrderItemInput).min(1, "Order must contain at least one item"),
    notes: z.string().max(500).nullable().optional(),
  })
  .openapi("CreateOrderInput");

// The set of statuses that can be *set* via the public action endpoint.
// `pending` is excluded because that's the creation state.
export const OrderStatusAction = z
  .enum(["accepted", "preparing", "ready", "completed", "cancelled"])
  .openapi("OrderStatusAction");

export const UpdateOrderStatusInput = z
  .object({ status: OrderStatusAction })
  .openapi("UpdateOrderStatusInput");

// --- Business settings --------------------------------------------------
const OpeningHoursDay = z
  .object({
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
    closed: z.boolean(),
  })
  .openapi("OpeningHoursDay");

export const OpeningHours = z
  .object({
    mon: OpeningHoursDay,
    tue: OpeningHoursDay,
    wed: OpeningHoursDay,
    thu: OpeningHoursDay,
    fri: OpeningHoursDay,
    sat: OpeningHoursDay,
    sun: OpeningHoursDay,
  })
  .openapi("OpeningHours");

export const BusinessSettingsSelect = createSelectSchema(businessSettings, {
  openingHours: OpeningHours,
}).openapi("BusinessSettings");

export const BusinessSettingsUpdate = z
  .object({
    prepTimeMinutes: z.number().int().min(0).max(240).optional(),
    autoAccept: z.boolean().optional(),
    acceptingOrders: z.boolean().optional(),
    taxRateBps: z.number().int().min(0).max(2000).optional(),
    openingHours: OpeningHours.optional(),
  })
  .openapi("BusinessSettingsUpdate");

// --- Stats --------------------------------------------------------------
export const HomeStats = z
  .object({
    totalOrdersToday: z.number().int(),
    revenueTodayCents: z.number().int(),
    pendingOrders: z.number().int(),
    inProgressOrders: z.number().int(),
    completedOrdersToday: z.number().int(),
    averageOrderValueCents: z.number().int(),
    popularItems: z.array(
      z.object({
        menuItemId: z.number().int(),
        name: z.string(),
        soldCount: z.number().int(),
      })
    ),
  })
  .openapi("HomeStats");

export const CustomerWithStats = CustomerSelect.extend({
  orderCount: z.number().int(),
  lifetimeSpendCents: z.number().int(),
  lastOrderAt: z.string().nullable(),
}).openapi("CustomerWithStats");

// --- Errors -------------------------------------------------------------
export const ApiError = z
  .object({
    error: z.string(),
    code: z.string(),
    details: z.unknown().optional(),
  })
  .openapi("ApiError");