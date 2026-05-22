import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { DB } from "../db/client";
import { businessSettings } from "../db/schema";
import type { BusinessSettingsUpdate, OpeningHours } from "../db/zod";

const SETTINGS_ID = 1;

const defaultOpeningHours: z.infer<typeof OpeningHours> = {
  mon: { open: "09:00", close: "21:00", closed: false },
  tue: { open: "09:00", close: "21:00", closed: false },
  wed: { open: "09:00", close: "21:00", closed: false },
  thu: { open: "09:00", close: "21:00", closed: false },
  fri: { open: "09:00", close: "22:00", closed: false },
  sat: { open: "10:00", close: "22:00", closed: false },
  sun: { open: "10:00", close: "20:00", closed: false },
};

/**
 * Load the singleton settings row, lazily creating it with defaults the first
 * time it is requested. Idempotent.
 */
export async function loadSettings(db: DB) {
  const [row] = await db
    .select()
    .from(businessSettings)
    .where(eq(businessSettings.id, SETTINGS_ID))
    .limit(1);
  if (row) return row;
  const [created] = await db
    .insert(businessSettings)
    .values({ id: SETTINGS_ID, openingHours: defaultOpeningHours })
    .returning();
  if (!created) throw new Error("Failed to initialize business_settings");
  return created;
}

export async function updateSettings(db: DB, patch: z.infer<typeof BusinessSettingsUpdate>) {
  await loadSettings(db);
  const [updated] = await db
    .update(businessSettings)
    .set(patch)
    .where(eq(businessSettings.id, SETTINGS_ID))
    .returning();
  if (!updated) throw new Error("Failed to update business_settings");
  return updated;
}
