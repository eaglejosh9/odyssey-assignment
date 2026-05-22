/**
 * Cross-cutting types that don't naturally live in the API contract.
 *
 * Anything related to API request/response shapes (including enums like
 * OrderStatus) lives in `@odyssey/api-client/generated`. Duplicating those here
 * is forbidden — see ARCHITECTURE.md.
 */

export type ThemeName = "light" | "dark";

/**
 * Brand utility — produces a nominal type for primitives so two `number` IDs
 * with different domains don't accidentally interop.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type Cents = Brand<number, "Cents">;
