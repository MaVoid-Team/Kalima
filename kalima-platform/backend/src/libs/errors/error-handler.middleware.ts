import { Request, Response, NextFunction } from "express";
import { ApiError, ValidationError } from "./api-error";

/**
 * Global Express error-handler middleware.
 *
 * Mount this **after** all routes:
 *   app.use(errorHandler);
 *
 * How it works:
 *  1. If the error is a `ValidationError`, respond with `{ success, message, errors }`.
 *  2. If the error is any other `ApiError`, respond with `{ success, message }`.
 *  3. If the error is unknown / not operational, log it and respond with a generic 500.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // --- Validation errors (422) include the `errors` array ---
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // --- Known operational API errors ---
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // --- Unknown / programmer errors ---
  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
