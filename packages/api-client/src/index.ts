/**
 * Public surface of the API client package.
 *
 * `./generated` re-exports the Orval-generated hooks and types — those are the
 * single source of truth for API shapes on the frontend.
 *
 * NOTE: Run `pnpm gen:contract` from the repo root to produce
 * `src/generated/*` before the dashboard can import from here.
 */
export * from "./mutator";

// Re-export the generated barrel if it exists. The dashboard imports from
// "@odyssey/api-client/generated" directly, which works pre- and post-codegen.
