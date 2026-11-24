"use client";

import { useTranslations } from "next-intl";
import { BrandMark } from "./brand-mark";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ message, className = "" }: LoadingScreenProps) {
  const tApp = useTranslations("app");
  const tShared = useTranslations("shared");

  const appName = tApp("name");
  const appTagline = tApp("tagline");
  const displayMessage = message ?? tShared("loading");

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background select-none ${className}`}
    >
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <BrandMark size={96} alt="" className="mb-6" />

        {/* Brand identity */}
        <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{appName}</h1>
        <p className="mt-1 text-xs font-medium text-text-secondary sm:text-sm">{appTagline}</p>

        {/* Modern indeterminate progress bar */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="relative h-1.5 w-44 sm:w-52 overflow-hidden rounded-full bg-border/60" aria-hidden>
            <div className="absolute inset-y-0 w-2/5 rounded-full bg-primary animate-progress-slide" />
          </div>

          {/* Status text */}
          <p className="text-xs font-medium tracking-wide text-text-muted">{displayMessage}</p>
        </div>
      </div>
    </div>
  );
}
