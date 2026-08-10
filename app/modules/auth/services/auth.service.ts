import { apiClient } from "@/lib/api/client";
import type { AuthTokens } from "@/lib/auth/types";

export async function loginRequest(
  username: string,
  password: string,
): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>(
    "/auth/login",
    { username, password },
    { skipAuth: true },
  );
}

export async function refreshRequest(refreshToken: string): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>(
    "/auth/refresh",
    { refreshToken },
    { skipAuth: true },
  );
}

export async function logoutRequest(
  refreshToken: string,
): Promise<{ loggedOut: true }> {
  return apiClient.post<{ loggedOut: true }>(
    "/auth/logout",
    { refreshToken },
    { skipAuth: true },
  );
}
