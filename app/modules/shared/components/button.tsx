import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "default" | "sm";
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-surface-muted disabled:text-text-muted disabled:border-transparent",
  secondary:
    "border border-border bg-transparent text-text-primary hover:bg-surface-muted disabled:bg-transparent disabled:text-text-muted",
  danger:
    "bg-danger text-white hover:opacity-90 disabled:bg-surface-muted disabled:text-text-muted",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary disabled:text-text-muted",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "min-h-11 px-4 py-2 text-base",
  sm: "min-h-9 px-3 py-1.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`ds-focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
