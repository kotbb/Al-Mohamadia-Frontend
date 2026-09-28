import { ApiError } from "./types";

export function userFacingErrorMessage(
  error: unknown,
  rateLimitMessage: string,
  fallback: string,
): string {
  if (error instanceof ApiError && error.statusCode === 429) {
    return rateLimitMessage;
  }
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
