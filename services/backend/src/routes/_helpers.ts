import type { Context } from "hono";
import { DomainError } from "../services/errors";
import { InvalidStatusTransitionError } from "../services/order-status";

/**
 * Convert domain errors into the typed { error, code, details? } shape.
 * Anything we don't recognize is re-thrown to bubble to the global error
 * handler so we surface unexpected failures instead of swallowing them.
 *
 * Return type is `any` because Hono's `RouteConfigToTypedResponse` doesn't
 * accept a value that unions across multiple `c.json(body, status)` literal
 * shapes. At runtime each branch's body satisfies the `ApiError` schema
 * declared on the route — verified by the OpenAPI definition.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorResponse(c: Context, err: unknown): any {
  if (err instanceof InvalidStatusTransitionError) {
    return c.json(
      { error: err.message, code: err.code, details: { from: err.from, to: err.to } },
      409
    );
  }
  if (err instanceof DomainError) {
    return c.json(
      { error: err.message, code: err.code, details: err.details },
      err.httpStatus as 400 | 404 | 409 | 503
    );
  }
  throw err;
}