/**
 * Custom application error classes.
 *
 * These are thrown from services and caught by the centralized
 * error-handling middleware. Never return raw res.status() from services.
 */

/** Base application error with HTTP status code and error code */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** 400 — Request validation failed */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly errorCode = "VALIDATION_ERROR";

  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

/** 401 — Authentication required */
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly errorCode = "UNAUTHORIZED";

  constructor(message = "Authentication required") {
    super(message);
  }
}

/** 403 — Authenticated but not authorized */
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly errorCode = "FORBIDDEN";

  constructor(message = "Access denied") {
    super(message);
  }
}

/** 404 — Resource not found */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly errorCode = "NOT_FOUND";

  constructor(resource: string, identifier?: string) {
    super(identifier ? `${resource} not found: ${identifier}` : `${resource} not found`);
  }
}

/** 409 — Conflict with current state */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly errorCode = "CONFLICT";

  constructor(message: string) {
    super(message);
  }
}

/** 429 — Rate limit exceeded */
export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly errorCode = "RATE_LIMITED";

  constructor(message = "Too many requests, please try again later") {
    super(message);
  }
}
