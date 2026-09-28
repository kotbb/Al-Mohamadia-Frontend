import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-base font-medium text-text-secondary">{label}</span>
      <input
        id={inputId}
        className={`ds-focus-input min-h-11 w-full rounded-xl border bg-surface px-4 text-base text-text-primary placeholder:text-text-muted disabled:bg-surface-muted disabled:text-text-muted ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />
      {hint && !error ? (
        <span id={`${inputId}-hint`} className="text-sm text-text-muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          id={`${inputId}-error`}
          className="text-sm text-danger"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
