export type { AuthUser, UserRole, AuthTokens } from "@/lib/auth/types";

export interface CreateAdminInput {
  username: string;
  password: string;
}

export interface UpdateUserActiveInput {
  isActive: boolean;
}
