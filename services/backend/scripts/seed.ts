/**
 * Idempotent seed. Wipes the ordering tables and reinserts a baseline of
 * categories, menu items, customers, a few orders across statuses, and the
 * singleton settings row. Run with `pnpm db:seed`.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  businessSettings,
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orders,
} from "../src/db/schema";
import { computeTotals } from "../src/services/totals";

const TAX_RATE_BPS = 875; // 8.75%

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  const db = drizzle(client, { schema: { menuCategories, menuItems, customers, orders, orderItems, businessSettings } });

  console.log("Clearing existing data...");
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(menuItems);
  await db.delete(menuCategories);
  await db.delete(customers);
  await db.delete(businessSettings);

  console.log("Inserting settings...");
  await db.insert(businessSettings).values({
    id: 1,
    prepTimeMinutes: 18,
    autoAccept: false,
    acceptingOrders: true,
    taxRateBps: TAX_RATE_BPS,
    openingHours: {
      mon: { open: "11:00", close: "22:00", closed: false },
      tue: { open: "11:00", close: "22:00", closed: false },
      wed: { open: "11:00", close: "22:00", closed: false },
      thu: { open: "11:00", close: "22:00", closed: false },
      fri: { open: "11:00", close: "23:00", closed: false },
      sat: { open: "10:00", close: "23:00", closed: false },
      sun: { open: "10:00", close: "21:00", closed: false },
    },
  });

  console.log("Inserting categories...");
  const insertedCats = await db
    .insert(menuCategories)
    .values([
      { name: "Starters", sortOrder: 0 },
      { name: "Mains", sortOrder: 1 },
      { name: "Sides", sortOrder: 2 },
      { name: "Desserts", sortOrder: 3 },
      { name: "Drinks", sortOrder: 4 },
    ])
    .returning();
  const cat = (name: string) => insertedCats.find((c) => c.name === name)!;

  console.log("Inserting menu items...");
  const insertedItems = await db
    .insert(menuItems)
    .values([
      { categoryId: cat("Starters").id, name: "Bruschetta", description: "Toasted sourdough, heirloom tomato, basil", priceCents: 1200, available: true },
      { categoryId: cat("Starters").id, name: "Burrata", description: "Stracciatella, peach, balsamic", priceCents: 1600, available: true },
      { categoryId: cat("Starters").id, name: "Calamari", description: "Crispy squid, lemon aioli", priceCents: 1500, available: false },
      { categoryId: cat("Mains").id, name: "Margherita Pizza", description: "San Marzano, mozzarella, basil", priceCents: 1800, available: true },
      { categoryId: cat("Mains").id, name: "Tagliatelle Bolognese", description: "Slow-braised beef ragu", priceCents: 2200, available: true },
      { categoryId: cat("Mains").id, name: "Wood-Fired Salmon", description: "Lemon herb butter, seasonal greens", priceCents: 3200, available: true },
      { categoryId: cat("Mains").id, name: "Wagyu Burger", description: "Brioche bun, aged cheddar, truffle aioli", priceCents: 2600, available: true },
      { categoryId: cat("Sides").id, name: "Truffle Fries", description: "Parmesan, parsley", priceCents: 900, available: true },
      { categoryId: cat("Sides").id, name: "Caesar Salad", description: "Romaine, anchovy, parmesan", priceCents: 1100, available: true },
      { categoryId: cat("Desserts").id, name: "Tiramisu", description: "Mascarpone, espresso, cocoa", priceCents: 1100, available: true },
      { categoryId: cat("Desserts").id, name: "Affogato", description: "Vanilla gelato, espresso", priceCents: 900, available: true },
      { categoryId: cat("Drinks").id, name: "Sparkling Water", priceCents: 500, available: true },
      { categoryId: cat("Drinks").id, name: "House Red", description: "Sangiovese, Tuscany", priceCents: 1400, available: true },
    ])
    .returning();

  console.log("Inserting customers...");
  const insertedCustomers = await db
    .insert(customers)
    .values([
      { name: "Lena Ortiz", email: "lena.ortiz@example.com", phone: "+1 415 555 0190" },
      { name: "Marcus Hale", email: "marcus.hale@example.com", phone: "+1 415 555 0124" },
      { name: "Priya Singh", email: "priya.singh@example.com", phone: "+1 415 555 0117" },
      { name: "Daniel Cho", email: "daniel.cho@example.com", phone: "+1 415 555 0103" },
      { name: "Walk-in", phone: null, email: null },
    ])
    .returning();

  console.log("Inserting orders...");
  type Line = { item: (typeof insertedItems)[number]; qty: number };
  const orderFixtures: Array<{
    customerIdx: number;
    status: "pending" | "accepted" | "preparing" | "ready" | "completed" | "cancelled";
    minutesAgo: number;
    notes?: string;
    lines: Line[];
  }> = [
    { customerIdx: 0, status: "pending", minutesAgo: 4, lines: [
      { item: insertedItems[3]!, qty: 1 }, { item: insertedItems[7]!, qty: 1 },
    ] },
    { customerIdx: 1, status: "accepted", minutesAgo: 9, notes: "No onions", lines: [
      { item: insertedItems[6]!, qty: 2 }, { item: insertedItems[11]!, qty: 2 },
    ] },
    { customerIdx: 2, status: "preparing", minutesAgo: 18, lines: [
      { item: insertedItems[4]!, qty: 1 }, { item: insertedItems[9]!, qty: 1 },
    ] },
    { customerIdx: 3, status: "ready", minutesAgo: 24, lines: [
      { item: insertedItems[5]!, qty: 1 }, { item: insertedItems[12]!, qty: 1 },
    ] },
    { customerIdx: 0, status: "completed", minutesAgo: 90, lines: [
      { item: insertedItems[0]!, qty: 1 }, { item: insertedItems[3]!, qty: 1 }, { item: insertedItems[10]!, qty: 1 },
    ] },
    { customerIdx: 1, status: "completed", minutesAgo: 60 * 26, lines: [
      { item: insertedItems[4]!, qty: 2 }, { item: insertedItems[8]!, qty: 1 },
    ] },
    { customerIdx: 4, status: "cancelled", minutesAgo: 200, lines: [
      { item: insertedItems[6]!, qty: 1 },
    ] },
  ];

  for (const fx of orderFixtures) {
    const customer = insertedCustomers[fx.customerIdx]!;
    const totals = computeTotals(
      fx.lines.map((l) => ({ priceCents: l.item.priceCents, quantity: l.qty })),
      TAX_RATE_BPS
    );
    const placedAt = new Date(Date.now() - fx.minutesAgo * 60 * 1000);
    const [order] = await db
      .insert(orders)
      .values({
        customerId: customer.id,
        status: fx.status,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        notes: fx.notes ?? null,
        placedAt,
      })
      .returning();
    await db.insert(orderItems).values(
      fx.lines.map((l) => ({
        orderId: order!.id,
        menuItemId: l.item.id,
        nameSnapshot: l.item.name,
        priceSnapshotCents: l.item.priceCents,
        quantity: l.qty,
      }))
    );
  }

  await client.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
