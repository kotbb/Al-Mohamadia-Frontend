"use client";

import { useTranslations } from "next-intl";

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
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 46%, rgba(111, 68, 40, 0.08), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Emblem badge with subtle pulsing glow */}
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className="absolute -inset-3 rounded-3xl bg-primary/10 blur-xl animate-brand-pulse pointer-events-none"
            aria-hidden
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border/80 bg-surface/90 p-3.5 shadow-elevation-1 backdrop-blur-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icon-mark.png"
              alt={appName}
              width={56}
              height={56}
              className="h-full w-full rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Brand identity */}
        <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
          {appName}
        </h1>
        <p className="mt-1 text-xs font-medium text-text-secondary sm:text-sm">
          {appTagline}
        </p>

        {/* Modern indeterminate progress bar */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div
            className="relative h-1.5 w-44 sm:w-52 overflow-hidden rounded-full bg-border/60"
            aria-hidden
          >
            <div className="absolute inset-y-0 w-2/5 rounded-full bg-primary animate-progress-slide" />
          </div>

          {/* Status text */}
          <p className="text-xs font-medium tracking-wide text-text-muted">
            {displayMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
