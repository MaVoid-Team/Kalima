// ============================================
// BASE API ERROR
// ============================================

/**
 * Base class for all operational API errors.
 * Carries an HTTP status code so the error handler middleware
 * can send the correct response without guessing.
 *
 * `isOperational` distinguishes known/expected errors (bad input,
 * auth failure …) from unexpected bugs.  The error-handler middleware
 * uses this flag to decide whether to expose the message to the client.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Fix prototype chain for `instanceof` checks after transpilation
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// ============================================
// 4xx CLIENT ERRORS
// ============================================

/** 400 — The request is malformed or contains invalid data. */
export class BadRequestError extends ApiError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

/** 401 — Authentication is missing or invalid. */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

/** 403 — The user is authenticated but lacks permission. */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

/** 404 — The requested resource does not exist. */
export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, message);
  }
}

/** 409 — The request conflicts with the current state (e.g. duplicate). */
export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

/** 422 — Validation failed. Carries an `errors` array with details. */
export class ValidationError extends ApiError {
  public readonly errors: string[];

  constructor(errors: string[], message = "Validation failed") {
    super(422, message);
    this.errors = errors;
  }
}

/** 429 — Too many requests — rate-limit exceeded. */
export class TooManyRequestsError extends ApiError {
  constructor(message = "Too many requests") {
    super(429, message);
  }
}

// ============================================
// 5xx SERVER ERRORS
// ============================================

/** 500 — An unexpected internal error (isOperational = false by default). */
export class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(500, message, false);
  }
}
