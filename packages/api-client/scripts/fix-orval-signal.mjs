#!/usr/bin/env node
/**
 * Patch a known Orval 7.21 codegen bug: when an endpoint takes no body/path
 * params, the generated queryFn invokes the client function with a bare
 * AbortSignal where it should pass a `{ signal }` RequestInit.
 *
 * This script rewrites those call sites in place. Idempotent — safe to re-run.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatedRoot = resolve(__dirname, "..", "src", "generated");

/** Recursively yield every .ts file under root. */
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && full.endsWith(".ts")) yield full;
  }
}

const patterns = [
  // ", signal)" at end of a queryFn call → ", { signal })"
  { re: /(\bget[A-Z]\w*\([^)]*?), signal\)/g, sub: "$1, { signal })" },
  // "(signal)" as the sole arg → "({ signal })"
  { re: /(\bget[A-Z]\w*)\(signal\)/g, sub: "$1({ signal })" },
];

let patched = 0;
for await (const file of walk(generatedRoot)) {
  const src = await readFile(file, "utf8");
  let out = src;
  for (const { re, sub } of patterns) out = out.replace(re, sub);
  if (out !== src) {
    await writeFile(file, out);
    patched++;
  }
}
console.log(`fix-orval-signal: patched ${patched} file(s).`);