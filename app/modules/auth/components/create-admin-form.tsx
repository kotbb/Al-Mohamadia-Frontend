"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { UserRole } from "@/lib/auth/types";
import { Input } from "@/app/modules/shared/components/input";
import { Button } from "@/app/modules/shared/components/button";

interface CreateAdminFormProps {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role?: UserRole;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange?: (value: UserRole) => void;
  roleLocked?: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => Promise<void>;
  variant?: "page" | "modal";
  /** Create requires password; edit makes it optional */
  mode?: "create" | "edit";
}

export function CreateAdminForm({
  firstName,
  lastName,
  username,
  password,
  role = "admin",
  onFirstNameChange,
  onLastNameChange,
  onUsernameChange,
  onPasswordChange,
  onRoleChange,
  roleLocked = false,
  isSubmitting,
  error,
  onSubmit,
  variant = "page",
  mode = "create",
}: CreateAdminFormProps) {
  const t = useTranslations("users");
  const isModal = variant === "modal";
  const isEdit = mode === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit();
  }

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 0 &&
    (isEdit ? password.length === 0 || password.length >= 8 : password.length >= 8);

  const fields = (
    <>
      {!isModal ? (
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {isEdit ? t("editTitle") : t("createTitle")}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {isEdit ? t("editSubtitle") : t("createSubtitle")}
          </p>
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          {isEdit ? t("editSubtitle") : t("createSubtitle")}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="adminFirstName"
          label={t("firstName")}
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => onFirstNameChange(event.target.value)}
          required
          disabled={isSubmitting}
        />
        <Input
          name="adminLastName"
          label={t("lastName")}
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => onLastNameChange(event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="adminUsername"
          label={t("username")}
          autoComplete="off"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          required
          disabled={isSubmitting}
        />
        <Input
          name="adminPassword"
          type="password"
          label={t("password")}
          autoComplete="new-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required={!isEdit}
          minLength={isEdit ? undefined : 8}
          hint={isEdit ? t("passwordHintOptional") : t("passwordHint")}
          disabled={isSubmitting}
        />
      </div>

      {isEdit && onRoleChange ? (
        <label className="flex w-full flex-col gap-1.5">
          <span className="text-base font-medium text-text-secondary">{t("colRole")}</span>
          <select
            name="adminRole"
            value={role}
            disabled={isSubmitting || roleLocked}
            onChange={(event) => onRoleChange(event.target.value as UserRole)}
            className="ds-focus-input min-h-11 rounded-xl border border-border bg-surface px-4 text-base text-text-primary disabled:bg-surface-muted disabled:text-text-muted"
          >
            <option value="admin">{t("roleAdmin")}</option>
            <option value="super_admin">{t("roleSuperAdmin")}</option>
          </select>
        </label>
      ) : null}

      {error ? (
        <p
          className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {!isModal ? (
        <div>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting
              ? isEdit
                ? t("saving")
                : t("creating")
              : isEdit
                ? t("saveChanges")
                : t("createSubmit")}
          </Button>
        </div>
      ) : null}
    </>
  );

  if (isModal) {
    return <div className="flex flex-col gap-5">{fields}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {fields}
    </form>
  );
}
