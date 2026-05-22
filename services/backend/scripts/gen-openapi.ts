/**
 * Generates openapi.json from the Hono app and writes it to disk so Orval can
 * consume it. Run via `pnpm gen:contract` from the repo root.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "../src/app";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "..", "openapi.json");

async function main() {
  const app = createApp();
  // The /openapi.json handler bypasses the DB middleware (see src/app.ts), so
  // we don't need a real connection string here.
  const res = await app.request("/openapi.json", undefined, {});
  const json = await res.json();
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(json, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
