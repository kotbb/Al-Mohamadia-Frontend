"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";

interface CategoryFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  name: string;
  onNameChange: (value: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => Promise<void>;
}

export function CategoryFormModal({
  open,
  mode,
  onClose,
  name,
  onNameChange,
  isSubmitting,
  error,
  onSubmit,
}: CategoryFormModalProps) {
  const t = useTranslations("categories");
  const isEdit = mode === "edit";
  const canSubmit = name.trim().length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit();
  }

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
            form="category-form"
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
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">
          {isEdit ? t("editSubtitle") : t("createSubtitle")}
        </p>
        <Input
          name="categoryName"
          label={t("fieldName")}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          required
          disabled={isSubmitting}
          autoComplete="off"
        />
        {error ? (
          <p
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
