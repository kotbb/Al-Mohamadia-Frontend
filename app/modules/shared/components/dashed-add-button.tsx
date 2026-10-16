import type { ButtonHTMLAttributes } from "react";

interface DashedAddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function DashedAddButton({
  label,
  className = "",
  ...props
}: DashedAddButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`ds-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:bg-surface-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="M8 3v10M3 8h10" />
      </svg>
      {label}
    </button>
  );
}
