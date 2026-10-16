"use client";

import { useEffect, useState } from "react";
import { MergePhoneField } from "@/app/modules/shared/components/merge-phone-field";
import { isOptionalMobile } from "@/app/modules/shared/utils/egyptian-mobile";
import { useTranslations } from "next-intl";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";

interface SupplierMergeModalProps {
  open: boolean;
  onClose: () => void;
  options: Supplier[];
  targetId: string;
  onTargetChange: (id: string) => void;
  sourceIds: string[];
  onToggleSource: (id: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (phone?: string | null) => Promise<void>;
}

export function SupplierMergeModal({
  open,
  onClose,
  options,
  targetId,
  onTargetChange,
  sourceIds,
  onToggleSource,
  isSubmitting,
  error,
  onSubmit,
}: SupplierMergeModalProps) {
  const t = useTranslations("suppliers");
  const [phoneError, setPhoneError] = useState(false);
  const [phoneOverride, setPhoneOverride] = useState<string | null>(null);
  useEffect(() => {
    if (!open) {
      setPhoneOverride(null);
      setPhoneError(false);
    }
  }, [open]);
  const canSubmit = Boolean(targetId) && sourceIds.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("mergeTitle")}
      size="lg"
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
            type="button"
            variant="primary"
            disabled={isSubmitting || !canSubmit}
            onClick={() => {
              const originalPhone =
                options.find((option) => option.id === targetId)?.phone ?? "";
              if (
                phoneOverride !== null &&
                phoneOverride !== originalPhone &&
                !isOptionalMobile(phoneOverride)
              ) {
                setPhoneError(true);
                return;
              }
              setPhoneError(false);
              void onSubmit(
                phoneOverride === null
                  ? undefined
                  : phoneOverride.trim() || null,
              );
            }}
          >
            {isSubmitting ? t("merging") : t("mergeSubmit")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">{t("mergeSubtitle")}</p>

        <label className="flex w-full flex-col gap-1.5">
          <span className="text-base font-medium text-text-secondary">
            {t("mergeTargetLabel")}
          </span>
          <select
            className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-text-primary"
            value={targetId}
            disabled={isSubmitting}
            onChange={(event) => {
              setPhoneOverride(null);
              setPhoneError(false);
              onTargetChange(event.target.value);
            }}
          >
            <option value="">{t("mergeTargetPlaceholder")}</option>
            {options.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
                {supplier.phone ? ` - ${supplier.phone}` : ""}
              </option>
            ))}
          </select>
        </label>

        <MergePhoneField
          name="supplierMergePhone"
          value={phoneOverride}
          currentPhone={
            options.find((option) => option.id === targetId)?.phone ?? null
          }
          disabled={isSubmitting || !targetId}
          showError={phoneError}
          onChange={(value) => {
            setPhoneError(false);
            setPhoneOverride(value);
          }}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-base font-medium text-text-secondary">
            {t("mergeSourcesLabel")}
          </legend>
          <div className="max-h-56 overflow-y-auto rounded-xl border border-border">
            {options
              .filter((supplier) => supplier.id !== targetId)
              .map((supplier) => {
                const checked = sourceIds.includes(supplier.id);
                return (
                  <label
                    key={supplier.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-surface-muted"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={checked}
                      disabled={isSubmitting || !targetId}
                      onChange={() => onToggleSource(supplier.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-text-primary">
                        {supplier.name}
                      </span>
                      <span className="block text-sm text-text-muted">
                        {supplier.phone ?? "-"}
                      </span>
                    </span>
                  </label>
                );
              })}
          </div>
        </fieldset>

        <div
          className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-text-secondary"
          role="note"
        >
          {t("mergeWarning")}
        </div>

        {error ? (
          <p
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
