import { asc, eq } from "drizzle-orm";
import type { z } from "zod";
import type { DB } from "../db/client";
import { menuCategories, menuItems } from "../db/schema";
import type { MenuCategoryInsert, MenuItemInsert, MenuItemUpdate } from "../db/zod";
import { NotFoundError } from "./errors";

export async function listCategories(db: DB) {
  return db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder), asc(menuCategories.id));
}

export async function createCategory(db: DB, input: z.infer<typeof MenuCategoryInsert>) {
  const [created] = await db.insert(menuCategories).values(input).returning();
  if (!created) throw new Error("Failed to insert category");
  return created;
}

export async function listItems(db: DB) {
  return db.select().from(menuItems).orderBy(asc(menuItems.id));
}

export async function createItem(db: DB, input: z.infer<typeof MenuItemInsert>) {
  const [created] = await db.insert(menuItems).values(input).returning();
  if (!created) throw new Error("Failed to insert menu item");
  return created;
}

export async function updateItem(db: DB, id: number, patch: z.infer<typeof MenuItemUpdate>) {
  const [updated] = await db.update(menuItems).set(patch).where(eq(menuItems.id, id)).returning();
  if (!updated) throw new NotFoundError("MenuItem", id);
  return updated;
}

export async function deleteItem(db: DB, id: number) {
  const deleted = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
  if (deleted.length === 0) throw new NotFoundError("MenuItem", id);
}
