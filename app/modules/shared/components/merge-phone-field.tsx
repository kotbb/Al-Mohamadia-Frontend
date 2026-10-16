"use client";

import { useTranslations } from "next-intl";
import { Input } from "./input";

interface MergePhoneFieldProps {
  name: string;
  value: string | null;
  currentPhone: string | null;
  disabled: boolean;
  onChange: (value: string | null) => void;
}

export function MergePhoneField({
  name,
  value,
  currentPhone,
  disabled,
  onChange,
}: MergePhoneFieldProps) {
  const t = useTranslations("shared");
  return (
    <div className="flex flex-col gap-3">
      <label className="flex min-h-11 items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={value !== null}
          disabled={disabled}
          className="accent-primary"
          onChange={(event) =>
            onChange(event.target.checked ? (currentPhone ?? "") : null)
          }
        />
        {t("mergePhoneOverride")}
      </label>
      {value !== null ? (
        <Input
          name={name}
          label={t("optionalPhone")}
          hint={t("clearPhoneHint")}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}
