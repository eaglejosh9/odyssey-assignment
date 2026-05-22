import { z } from "@hono/zod-openapi";

// Re-export the patched zod from @hono/zod-openapi so callers can use the
// same `z.openapi(...)` extensions in our drizzle-zod adapters.
export { z };
