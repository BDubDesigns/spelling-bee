import { z } from "zod";

/**
 * API response schemas.
 *
 * All API endpoints return a consistent response shape:
 * - Success: { success: true, data: T }
 * - Error: { success: false, error: { code: string, message: string } }
 */

/** Standard API error codes */
export const apiErrorCodeSchema = z.enum([
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "VALIDATION_ERROR",
  "INTERNAL_ERROR",
]);

/** Successful API response */
export const apiSuccessResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
): z.ZodObject<{ success: z.ZodLiteral<true>; data: T }> =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

/** Error API response */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

/** Generic API response (union of success and error) */
export const apiResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
): z.ZodDiscriminatedUnion<"success", [z.ZodObject<{ success: z.ZodLiteral<true>; data: T }>, typeof apiErrorResponseSchema]> =>
  z.discriminatedUnion("success", [
    apiSuccessResponseSchema(dataSchema),
    apiErrorResponseSchema,
  ]);

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiSuccessResponse<T> = { success: true; data: T };
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Helper to create a success response */
export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  success: true,
  data,
});

/** Helper to create an error response */
export const createErrorResponse = (
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): ApiErrorResponse => ({
  success: false,
  error: { code, message, details },
});
