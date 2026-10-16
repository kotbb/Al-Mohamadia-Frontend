"use client";

import { LoadingScreen } from "./loading-screen";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  variant?: "inline" | "screen" | "card";
  className?: string;
}

export function LoadingState({
  message,
  fullScreen = false,
  variant = "inline",
  className = "",
}: LoadingStateProps) {
  if (fullScreen || variant === "screen") {
    return <LoadingScreen message={message} className={className} />;
  }

  const containerClasses =
    variant === "card"
      ? `flex flex-col items-center justify-center gap-3.5 rounded-xl border border-border/80 bg-surface/60 py-12 px-6 text-center ${className}`
      : `flex flex-col items-center justify-center gap-3.5 py-12 px-6 text-center ${className}`;

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
    >
      {/* Sleek dual-ring spinner */}
      <span className="relative flex h-8 w-8 items-center justify-center" aria-hidden>
        <span className="absolute h-8 w-8 rounded-full border-2 border-primary/20" />
        <span className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </span>

      {message ? (
        <p className="text-sm font-medium text-text-muted">{message}</p>
      ) : null}
    </div>
  );
}
