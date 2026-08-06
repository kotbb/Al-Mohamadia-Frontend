import { getApiUrl } from "./env";
import { ApiError, type ApiErrorBody, type ApiSuccess } from "./types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /** Reserved for Phase 1 — Bearer access token */
  accessToken?: string | null;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function isApiSuccess<T>(value: unknown): value is ApiSuccess<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as ApiSuccess<T>).success === true &&
    "data" in value
  );
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as ApiErrorBody).success === false
  );
}

/**
 * Shared fetch wrapper. Unwraps `{ success, data }` envelopes.
 * Auth refresh (single-flight on 401) will plug in here in Phase 1.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers, signal, accessToken } = options;
  const base = getApiUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new ApiError(payload);
    }
    throw new ApiError({
      success: false,
      statusCode: response.status,
      message: response.statusText || "Request failed",
      path: path,
      timestamp: new Date().toISOString(),
    });
  }

  if (isApiSuccess<T>(payload)) {
    return payload.data;
  }

  // Fallback if envelope is missing (should not happen with our backend)
  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "POST", body }),

  put: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "DELETE" }),
};
