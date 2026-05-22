import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type DB = NeonHttpDatabase<typeof schema>;

export function createDb(connectionString: string): DB {
  const client = neon(connectionString);
  return drizzle(client, { schema, logger: false });
}

export { schema };
