"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { UserRole } from "@/lib/auth/types";
import { CreateAdminForm } from "@/app/modules/auth/components/create-admin-form";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";

interface AdminFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: UserRole;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (value: UserRole) => void;
  roleLocked?: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => Promise<void>;
}

export function AdminFormModal({
  open,
  mode,
  onClose,
  firstName,
  lastName,
  username,
  password,
  role,
  onFirstNameChange,
  onLastNameChange,
  onUsernameChange,
  onPasswordChange,
  onRoleChange,
  roleLocked = false,
  isSubmitting,
  error,
  onSubmit,
}: AdminFormModalProps) {
  const t = useTranslations("users");
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("createTitle")}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("modalCancel")}
          </Button>
          <Button
            type="submit"
            form="admin-form"
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
      }
    >
      <form id="admin-form" onSubmit={handleSubmit}>
        <CreateAdminForm
          firstName={firstName}
          lastName={lastName}
          username={username}
          password={password}
          role={role}
          onFirstNameChange={onFirstNameChange}
          onLastNameChange={onLastNameChange}
          onUsernameChange={onUsernameChange}
          onPasswordChange={onPasswordChange}
          onRoleChange={onRoleChange}
          roleLocked={roleLocked}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={onSubmit}
          variant="modal"
          mode={mode}
        />
      </form>
    </Modal>
  );
}
