export type UserRole = "super_admin" | "admin";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
