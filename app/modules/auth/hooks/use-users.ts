"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/types";
import type { AuthUser } from "@/lib/auth/types";
import {
  createAdmin,
  deleteUser,
  listUsers,
  updateUser,
} from "@/app/modules/auth/services/users.service";

type ListStatus = "idle" | "loading" | "success" | "error";

export type UsersToastKind =
  | "created"
  | "updated"
  | "activated"
  | "deactivated"
  | "deleted";

export interface UsersToastState {
  kind: UsersToastKind;
  variant: "success" | "danger";
}

export type UsersConfirmKind = "deactivate" | "activate" | "delete" | null;

interface UseUsersResult {
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
  setFormFirstName: (value: string) => void;
  setFormLastName: (value: string) => void;
  setFormUsername: (value: string) => void;
  setFormPassword: (value: string) => void;
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
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<UsersToastState | null>(null);

  const [confirmKind, setConfirmKind] = useState<UsersConfirmKind>(null);
  const [confirmUser, setConfirmUser] = useState<AuthUser | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setListStatus("loading");
    setListError(null);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    listUsers(controller.signal)
      .then((result) => {
        setUsers(result);
        setListStatus("success");
        setListError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Request failed";
        setUsers([]);
        setListError(message);
        setListStatus("error");
      });

    return () => controller.abort();
  }, [tick]);

  const clearToast = useCallback(() => setToast(null), []);

  const resetForm = useCallback(() => {
    setFormFirstName("");
    setFormLastName("");
    setFormUsername("");
    setFormPassword("");
    setFormError(null);
    setEditingUserId(null);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setFormMode("create");
    setIsFormOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((user: AuthUser) => {
    setFormMode("edit");
    setEditingUserId(user.id);
    setFormFirstName(user.firstName ?? "");
    setFormLastName(user.lastName ?? "");
    setFormUsername(user.username);
    setFormPassword("");
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    if (isSaving) return;
    setIsFormOpen(false);
    resetForm();
  }, [isSaving, resetForm]);

  const submitForm = useCallback(async () => {
    setIsSaving(true);
    setFormError(null);
    setToast(null);
    try {
      if (formMode === "create") {
        await createAdmin({
          firstName: formFirstName.trim(),
          lastName: formLastName.trim(),
          username: formUsername.trim(),
          password: formPassword,
        });
        setToast({ kind: "created", variant: "success" });
      } else if (editingUserId) {
        await updateUser(editingUserId, {
          firstName: formFirstName.trim(),
          lastName: formLastName.trim(),
          username: formUsername.trim(),
          ...(formPassword.trim() ? { password: formPassword } : {}),
        });
        setToast({ kind: "updated", variant: "success" });
      }
      setIsFormOpen(false);
      resetForm();
      refresh();
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Save failed";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }, [
    formMode,
    editingUserId,
    formFirstName,
    formLastName,
    formUsername,
    formPassword,
    refresh,
    resetForm,
  ]);

  const openDeactivateConfirm = useCallback((user: AuthUser) => {
    setConfirmError(null);
    setConfirmUser(user);
    setConfirmKind("deactivate");
  }, []);

  const openActivateConfirm = useCallback((user: AuthUser) => {
    setConfirmError(null);
    setConfirmUser(user);
    setConfirmKind("activate");
  }, []);

  const openDeleteConfirm = useCallback((user: AuthUser) => {
    setConfirmError(null);
    setConfirmUser(user);
    setConfirmKind("delete");
  }, []);

  const closeConfirm = useCallback(() => {
    if (isConfirming) return;
    setConfirmKind(null);
    setConfirmUser(null);
    setConfirmError(null);
  }, [isConfirming]);

  const submitConfirm = useCallback(async () => {
    if (!confirmUser || !confirmKind) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      if (confirmKind === "delete") {
        await deleteUser(confirmUser.id);
        setUsers((current) => current.filter((item) => item.id !== confirmUser.id));
        setToast({ kind: "deleted", variant: "danger" });
      } else {
        const nextActive = confirmKind === "activate";
        const updated = await updateUser(confirmUser.id, { isActive: nextActive });
        setUsers((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        setToast(
          nextActive
            ? { kind: "activated", variant: "success" }
            : { kind: "deactivated", variant: "danger" },
        );
      }
      setConfirmKind(null);
      setConfirmUser(null);
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Action failed";
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  }, [confirmUser, confirmKind]);

  return {
    users,
    listStatus,
    listError,
    refresh,
    formMode,
    isFormOpen,
    openCreate,
    openEdit,
    closeForm,
    formFirstName,
    formLastName,
    formUsername,
    formPassword,
    setFormFirstName,
    setFormLastName,
    setFormUsername,
    setFormPassword,
    isSaving,
    formError,
    submitForm,
    toast,
    clearToast,
    confirmKind,
    confirmUser,
    isConfirming,
    confirmError,
    openDeactivateConfirm,
    openActivateConfirm,
    openDeleteConfirm,
    closeConfirm,
    submitConfirm,
  };
}
