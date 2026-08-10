"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/types";
import type { AuthUser } from "@/lib/auth/types";
import {
  createAdmin,
  listUsers,
  updateUserActive,
} from "@/app/modules/auth/services/users.service";

type ListStatus = "idle" | "loading" | "success" | "error";

export type UsersToastKind = "created" | "activated" | "deactivated";

export interface UsersToastState {
  kind: UsersToastKind;
  variant: "success" | "danger";
}

interface UseUsersResult {
  users: AuthUser[];
  listStatus: ListStatus;
  listError: string | null;
  refresh: () => void;
  createUsername: string;
  createPassword: string;
  setCreateUsername: (value: string) => void;
  setCreatePassword: (value: string) => void;
  isCreating: boolean;
  createError: string | null;
  toast: UsersToastState | null;
  clearToast: () => void;
  submitCreate: () => Promise<void>;
  togglingId: string | null;
  toggleError: string | null;
  toggleActive: (user: AuthUser) => Promise<void>;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [toast, setToast] = useState<UsersToastState | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

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

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const submitCreate = useCallback(async () => {
    setIsCreating(true);
    setCreateError(null);
    setToast(null);
    try {
      await createAdmin({
        username: createUsername.trim(),
        password: createPassword,
      });
      setCreateUsername("");
      setCreatePassword("");
      setToast({ kind: "created", variant: "success" });
      refresh();
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Create failed";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  }, [createUsername, createPassword, refresh]);

  const toggleActive = useCallback(async (user: AuthUser) => {
    const nextActive = !user.isActive;
    setTogglingId(user.id);
    setToggleError(null);
    try {
      const updated = await updateUserActive(user.id, {
        isActive: nextActive,
      });
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setToast(
        nextActive
          ? { kind: "activated", variant: "success" }
          : { kind: "deactivated", variant: "danger" },
      );
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Update failed";
      setToggleError(message);
    } finally {
      setTogglingId(null);
    }
  }, []);

  return {
    users,
    listStatus,
    listError,
    refresh,
    createUsername,
    createPassword,
    setCreateUsername,
    setCreatePassword,
    isCreating,
    createError,
    toast,
    clearToast,
    submitCreate,
    togglingId,
    toggleError,
    toggleActive,
  };
}
