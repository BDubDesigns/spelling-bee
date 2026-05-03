import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/errors";
import { createErrorResponse } from "@spelling-bee/shared";
import type { ApiErrorCode } from "@spelling-bee/shared";

/**
 * Centralized error-handling middleware.
 *
 * All errors thrown from routes/controllers flow here.
 * AppError instances return structured JSON; unknown errors return 500.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(createErrorResponse(err.errorCode as ApiErrorCode, err.message));
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json(createErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
};
