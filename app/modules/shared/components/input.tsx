"use client";

import { useEffect, useRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
  density?: "default" | "compact";
}

export function Input({
  label,
  error,
  hint,
  density = "default",
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || props.type !== "number") return;
    function preventWheelChange(event: WheelEvent) {
      if (document.activeElement === input) event.preventDefault();
    }
    input.addEventListener("wheel", preventWheelChange, { passive: false });
    return () => input.removeEventListener("wheel", preventWheelChange);
  }, [props.type]);

  return (
    <label
      className={`flex min-w-0 w-full flex-col ${density === "compact" ? "gap-1" : "gap-1.5"}`}
    >
      <span
        className={`${density === "compact" ? "text-sm" : "text-base"} font-medium text-text-secondary`}
      >
        {label}
      </span>
      <input
        ref={inputRef}
        id={inputId}
        className={`ds-focus-input min-h-11 w-full rounded-xl border bg-surface ${density === "compact" ? "px-3 text-sm" : "px-4 text-base"} text-text-primary placeholder:text-text-muted disabled:bg-surface-muted disabled:text-text-muted ${
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
