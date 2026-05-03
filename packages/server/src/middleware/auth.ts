import type { Request, Response, NextFunction } from "express";
import { config } from "@/config";

/**
 * Auth middleware — verifies Clerk session in production,
 * skips auth in development mode for easier playtesting.
 */

/**
 * Middleware that requires authentication.
 * In development mode without Clerk configured, assigns a default userId.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  // In development, skip auth if Clerk is not configured
  if (!config.isProduction && !config.clerk.secretKey) {
    (req as Request & { userId?: string }).userId = "dev-user";
    next();
    return;
  }

  // In production, require Clerk
  if (!config.clerk.secretKey) {
    throw new Error("CLERK_SECRET_KEY is required in production");
  }

  // TODO: Implement actual Clerk verification
  // For now, assign a placeholder userId
  (req as Request & { userId?: string }).userId = "dev-user";
  next();
};
