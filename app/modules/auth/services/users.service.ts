import { apiClient } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/types";
import type {
  CreateAdminInput,
  UpdateUserActiveInput,
  UpdateUserInput,
} from "@/app/modules/auth/types/auth.types";

export async function fetchMe(signal?: AbortSignal): Promise<AuthUser> {
  return apiClient.get<AuthUser>("/users/me", { signal });
}

export async function listUsers(signal?: AbortSignal): Promise<AuthUser[]> {
  return apiClient.get<AuthUser[]>("/users", { signal });
}

export async function createAdmin(input: CreateAdminInput): Promise<AuthUser> {
  return apiClient.post<AuthUser>("/users", input);
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<AuthUser> {
  return apiClient.patch<AuthUser>(`/users/${id}`, input);
}

export async function updateUserActive(
  id: string,
  input: UpdateUserActiveInput,
): Promise<AuthUser> {
  return updateUser(id, input);
}

export async function deleteUser(id: string): Promise<AuthUser> {
  return apiClient.delete<AuthUser>(`/users/${id}`);
}
