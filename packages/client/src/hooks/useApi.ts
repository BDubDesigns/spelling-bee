import { useCallback } from "react";
import type { ApiResponse } from "@spelling-bee/shared";

/**
 * API hook for making requests to the backend.
 *
 * Provides a typed fetch wrapper that handles errors consistently.
 */

const BASE_URL = "/api";

/** Custom error for API failures */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Typed fetch wrapper for API requests.
 *
 * @param endpoint - The API endpoint (without /api prefix)
 * @param options - Fetch options
 * @returns The parsed response data
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json() as ApiResponse<T>;

  if (!data.success) {
    throw new ApiError(
      response.status,
      data.error.code,
      data.error.message,
    );
  }

  return data.data;
};

/**
 * Hook providing API methods for the game.
 */
export const useApi = (): { get: <T>(endpoint: string) => Promise<T>; post: <T>(endpoint: string, body: unknown) => Promise<T> } => {
  const get = useCallback(async <T>(endpoint: string): Promise<T> => {
    return apiFetch<T>(endpoint, { method: "GET" });
  }, []);

  const post = useCallback(async <T>(endpoint: string, body: unknown): Promise<T> => {
    return apiFetch<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }, []);

  return { get, post };
};
