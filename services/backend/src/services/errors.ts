/**
 * Domain errors. Route handlers translate these into typed HTTP responses
 * matching the `ApiError` schema in src/db/zod.ts.
 */
export class DomainError extends Error {
  public readonly httpStatus: number;
  public readonly code: string;
  public readonly details?: unknown;
  constructor(message: string, opts: { code: string; httpStatus: number; details?: unknown }) {
    super(message);
    this.code = opts.code;
    this.httpStatus = opts.httpStatus;
    this.details = opts.details;
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: number | string) {
    super(`${entity} ${id} not found.`, { code: "NOT_FOUND", httpStatus: 404 });
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: unknown) {
    super(message, { code: "VALIDATION_ERROR", httpStatus: 400, details });
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, code = "CONFLICT") {
    super(message, { code, httpStatus: 409 });
  }
}

export class ServiceUnavailableError extends DomainError {
  constructor(message: string, code = "SERVICE_UNAVAILABLE") {
    super(message, { code, httpStatus: 503 });
  }
}
