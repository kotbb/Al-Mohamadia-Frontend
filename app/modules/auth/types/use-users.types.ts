import type { AuthUser, UserRole } from "@/lib/auth/types";

export type ListStatus = "idle" | "loading" | "success" | "error";

export type UsersToastKind =
  "created" | "updated" | "activated" | "deactivated" | "deleted";

export interface UsersToastState {
  kind: UsersToastKind;
  variant: "success" | "danger";
}

export type UsersConfirmKind = "deactivate" | "activate" | "delete" | null;

export interface UseUsersResult {
  users: AuthUser[];
  listStatus: ListStatus;
  listError: string | null;
  refresh: () => void;
  formMode: "create" | "edit";
  isFormOpen: boolean;
  openCreate: () => void;
  openEdit: (user: AuthUser) => void;
  closeForm: () => void;
  formFirstName: string;
  formLastName: string;
  formUsername: string;
  formPassword: string;
  formRole: UserRole;
  setFormFirstName: (value: string) => void;
  setFormLastName: (value: string) => void;
  setFormUsername: (value: string) => void;
  setFormPassword: (value: string) => void;
  setFormRole: (value: UserRole) => void;
  isSaving: boolean;
  formError: string | null;
  submitForm: () => Promise<void>;
  toast: UsersToastState | null;
  clearToast: () => void;
  confirmKind: UsersConfirmKind;
  confirmUser: AuthUser | null;
  isConfirming: boolean;
  confirmError: string | null;
  openDeactivateConfirm: (user: AuthUser) => void;
  openActivateConfirm: (user: AuthUser) => void;
  openDeleteConfirm: (user: AuthUser) => void;
  closeConfirm: () => void;
  submitConfirm: () => Promise<void>;
  roleLocked: boolean;
}
