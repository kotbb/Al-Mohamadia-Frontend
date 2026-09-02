import type { ReactNode } from "react";

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses: Record<NonNullable<SurfaceCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function SurfaceCard({
  children,
  className = "",
  padding = "md",
}: SurfaceCardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
