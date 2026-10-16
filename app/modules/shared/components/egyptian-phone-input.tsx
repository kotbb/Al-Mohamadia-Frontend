"use client";

import { useTranslations } from "next-intl";
import {
  formatMobileInput,
  isOptionalMobile,
  mobileInputValue,
} from "../utils/egyptian-mobile";

interface EgyptianPhoneInputProps {
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
  showError?: boolean;
}

export function EgyptianPhoneInput({
  name,
  label,
  value,
  onValueChange,
  disabled,
  hint,
  showError = false,
}: EgyptianPhoneInputProps) {
  const t = useTranslations("shared");
  const invalid = showError && !isOptionalMobile(value);
  const formattedValue = formatMobileInput(value);
  const guide = "1XX XXX XXXX";
  return (
    <label className="flex min-w-0 flex-col gap-1.5" htmlFor={name}>
      <span className="font-medium text-text-secondary">{label}</span>
      <span
        className={`flex min-h-11 items-center overflow-hidden rounded-xl border bg-surface focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-2 ${invalid ? "border-danger" : "border-border"}`}
        dir="ltr"
      >
        <span className="flex shrink-0 items-center gap-2 border-e border-border px-3 text-text-secondary">
          <span role="img" aria-label={t("egypt")}>
            🇪🇬
          </span>
          <span>+20</span>
        </span>
        <span className="relative min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center whitespace-pre px-3 font-mono text-base text-text-muted"
          >
            <span className="invisible">{formattedValue}</span>
            {guide.slice(formattedValue.length)}
          </span>
          <input
            id={name}
            name={name}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            maxLength={12}
            value={formattedValue}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={
              invalid ? `${name}-error` : hint ? `${name}-hint` : undefined
            }
            className="relative min-h-11 w-full min-w-0 bg-transparent px-3 font-mono text-base text-text-primary outline-none disabled:text-text-muted"
            onKeyDown={(event) => {
              const input = event.currentTarget;
              const caret = input.selectionStart;
              if (caret === null || caret !== input.selectionEnd) return;
              if (event.key === "Backspace" && input.value[caret - 1] === " ")
                input.setSelectionRange(caret - 1, caret - 1);
              if (event.key === "Delete" && input.value[caret] === " ")
                input.setSelectionRange(caret + 1, caret + 1);
            }}
            onChange={(event) => {
              const input = event.currentTarget;
              const before = input.value.slice(
                0,
                input.selectionStart ?? input.value.length,
              );
              const digitCount =
                before.replace(/[^0-9٠-٩۰-۹]/g, "").length -
                (before.startsWith("0") ? 1 : 0);
              const next = mobileInputValue(input.value);
              if (next !== null) {
                onValueChange(next);
                requestAnimationFrame(() => {
                  const formatted = formatMobileInput(next);
                  let caret = 0;
                  let digits = 0;
                  while (caret < formatted.length && digits < digitCount) {
                    if (/[0-9]/.test(formatted[caret])) digits++;
                    caret++;
                  }
                  input.setSelectionRange(caret, caret);
                });
              }
            }}
            onPaste={(event) => {
              const text = event.clipboardData.getData("text");
              // Full local/international numbers replace the field; short fragments use native selection handling.
              if (/^(?:\+|0)/.test(text.trim())) {
                event.preventDefault();
                const next = mobileInputValue(text);
                if (next !== null) onValueChange(next);
              }
            }}
          />
        </span>
      </span>
      {invalid ? (
        <span id={`${name}-error`} role="alert" className="text-sm text-danger">
          {t("invalidEgyptianMobile")}
        </span>
      ) : hint ? (
        <span id={`${name}-hint`} className="text-sm text-text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
