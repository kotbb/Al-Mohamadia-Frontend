"use client";

import { EgyptianPhoneInput } from "@/app/modules/shared/components/egyptian-phone-input";
import { isOptionalMobile } from "@/app/modules/shared/utils/egyptian-mobile";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";

interface CustomerFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  name: string;
  onNameChange: (value: string) => void;
  phone: string;
  originalPhone: string;
  onPhoneChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  balance: string;
  onBalanceChange: (value: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => Promise<void>;
}

export function CustomerFormModal({
  open,
  mode,
  onClose,
  name,
  onNameChange,
  phone,
  originalPhone,
  onPhoneChange,
  address,
  onAddressChange,
  balance,
  onBalanceChange,
  isSubmitting,
  error,
  onSubmit,
}: CustomerFormModalProps) {
  const t = useTranslations("customers");
  const isEdit = mode === "edit";
  const [phoneError, setPhoneError] = useState(false);
  function closeForm() {
    setPhoneError(false);
    onClose();
  }
  const canSubmit = name.trim().length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phone !== originalPhone && !isOptionalMobile(phone)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    await onSubmit();
  }

  return (
    <Modal
      open={open}
      onClose={closeForm}
      title={isEdit ? t("editTitle") : t("createTitle")}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={closeForm}
            disabled={isSubmitting}
          >
            {t("modalCancel")}
          </Button>
          <Button
            type="submit"
            form="customer-form"
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
      <form
        id="customer-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <p className="text-sm text-text-muted">
          {isEdit ? t("editSubtitle") : t("createSubtitle")}
        </p>
        <Input
          name="customerName"
          label={t("fieldName")}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          required
          disabled={isSubmitting}
          autoComplete="off"
        />
        <EgyptianPhoneInput
          name="customerPhone"
          label={t("fieldPhone")}
          value={phone}
          showError={phoneError}
          onValueChange={(value) => {
            setPhoneError(false);
            onPhoneChange(value);
          }}
          disabled={isSubmitting}
        />
        <Input
          name="customerAddress"
          label={t("fieldAddress")}
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          disabled={isSubmitting}
          autoComplete="off"
        />
        <Input
          name="customerBalance"
          label={isEdit ? t("fieldBalance") : t("fieldStartingBalance")}
          type="number"
          step="0.01"
          required={isEdit}
          hint={t("fieldBalanceHint")}
          value={balance}
          onChange={(event) => onBalanceChange(event.target.value)}
          disabled={isSubmitting}
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
