import type { Context } from "hono";
import { DomainError } from "../services/errors";
import { InvalidStatusTransitionError } from "../services/order-status";

/**
 * Convert domain errors into the typed { error, code, details? } shape.
 * Anything we don't recognize is re-thrown to bubble to the global error
 * handler so we surface unexpected failures instead of swallowing them.
 */
export function errorResponse(c: Context, err: unknown) {
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
