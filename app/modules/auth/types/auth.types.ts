export type { AuthUser, UserRole, AuthTokens } from "@/lib/auth/types";

export interface CreateAdminInput {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  isActive?: boolean;
  password?: string;
}

export interface UpdateUserActiveInput {
  isActive: boolean;
}
