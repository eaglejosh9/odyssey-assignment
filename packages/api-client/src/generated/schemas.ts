/**
 * Re-export every type from Orval's generated `schemas/` directory so the
 * dashboard's existing imports — `import { OrderStatus, ... } from "@odyssey/api-client/generated"` —
 * resolve to the true source of truth.
 *
 * If a backend field or enum changes, Orval rewrites the files under `./schemas/`
 * and TypeScript will surface every affected call site. No hand-maintained shadow.
 */
export * from "./schemas/index";