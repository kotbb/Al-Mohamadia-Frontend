import { getApiUrl } from "./env";
import { ApiError, type ApiErrorBody, type ApiSuccess } from "./types";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
} from "@/lib/auth/auth-storage";
import type { AuthTokens } from "@/lib/auth/types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /** Explicit Bearer token; when omitted, uses stored access token unless skipAuth */
  accessToken?: string | null;
  /** Do not attach Bearer or attempt refresh (public auth endpoints) */
  skipAuth?: boolean;
  /** Internal: already retried after refresh */
  _retried?: boolean;
}

let refreshPromise: Promise<AuthTokens> | null = null;

function isAuthPath(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return (
    normalized === "/auth/login" ||
    normalized === "/auth/refresh" ||
    normalized === "/auth/logout"
  );
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

async function refreshAccessToken(): Promise<AuthTokens> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearSession();
        throw new ApiError({
          success: false,
          statusCode: 401,
          message: "Missing refresh token",
          path: "/auth/refresh",
          timestamp: new Date().toISOString(),
        });
      }

      const base = getApiUrl();
      const response = await fetch(`${base}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const payload = await parseJsonSafe(response);

      if (!response.ok || !isApiSuccess<AuthTokens>(payload)) {
        clearSession();
        if (isApiErrorBody(payload)) {
          throw new ApiError(payload);
        }
        throw new ApiError({
          success: false,
          statusCode: response.status,
          message: response.statusText || "Refresh failed",
          path: "/auth/refresh",
          timestamp: new Date().toISOString(),
        });
      }

      setSession(payload.data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("al-mohamadia-auth-session", {
          detail: payload.data,
        }));
      }
      return payload.data;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/**
 * Shared fetch wrapper. Unwraps `{ success, data }` envelopes.
 * Attaches Bearer access token and single-flight refreshes on 401.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers,
    signal,
    accessToken,
    skipAuth = false,
    _retried = false,
  } = options;

  const base = getApiUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const shouldAttachAuth = !skipAuth && !isAuthPath(path);
  const token =
    accessToken !== undefined && accessToken !== null
      ? accessToken
      : shouldAttachAuth
        ? getAccessToken()
        : null;

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = await parseJsonSafe(response);

  if (
    response.status === 401 &&
    shouldAttachAuth &&
    !_retried &&
    !isAuthPath(path)
  ) {
    try {
      const refreshed = await refreshAccessToken();
      return apiRequest<T>(path, {
        ...options,
        accessToken: refreshed.accessToken,
        _retried: true,
      });
    } catch (refreshError) {
      if (refreshError instanceof ApiError) {
        throw refreshError;
      }
      throw new ApiError({
        success: false,
        statusCode: 401,
        message: "Session expired",
        path,
        timestamp: new Date().toISOString(),
      });
    }
  }

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

  return payload as T;
}

/**
 * Authenticated GET that returns a raw Blob (e.g. PDF streams that skip the JSON envelope).
 * Reuses the same Bearer + single-flight refresh behavior as apiRequest.
 */
export async function apiRequestBlob(
  path: string,
  options: Omit<ApiRequestOptions, "method" | "body"> = {},
): Promise<Blob> {
  const {
    headers,
    signal,
    accessToken,
    skipAuth = false,
    _retried = false,
  } = options;

  const base = getApiUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const requestHeaders = new Headers(headers);
  const shouldAttachAuth = !skipAuth && !isAuthPath(path);
  const token =
    accessToken !== undefined && accessToken !== null
      ? accessToken
      : shouldAttachAuth
        ? getAccessToken()
        : null;

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: requestHeaders,
    signal,
  });

  if (
    response.status === 401 &&
    shouldAttachAuth &&
    !_retried &&
    !isAuthPath(path)
  ) {
    try {
      const refreshed = await refreshAccessToken();
      return apiRequestBlob(path, {
        ...options,
        accessToken: refreshed.accessToken,
        _retried: true,
      });
    } catch (refreshError) {
      if (refreshError instanceof ApiError) {
        throw refreshError;
      }
      throw new ApiError({
        success: false,
        statusCode: 401,
        message: "Session expired",
        path,
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (!response.ok) {
    const payload = await parseJsonSafe(response);
    if (isApiErrorBody(payload)) {
      throw new ApiError(payload);
    }
    throw new ApiError({
      success: false,
      statusCode: response.status,
      message: response.statusText || "Request failed",
      path,
      timestamp: new Date().toISOString(),
    });
  }

  return response.blob();
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  getBlob: (
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => apiRequestBlob(path, options),

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
