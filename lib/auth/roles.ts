import type { UserRole } from "./types";

export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === "super_admin";
}
