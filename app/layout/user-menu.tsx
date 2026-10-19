"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { useTheme } from "@/lib/theme/theme-provider";
import type { Locale } from "@/i18n/routing";
import { getDisplayName, getInitials } from "@/lib/user/get-initials";

function preferenceOptionClass(active: boolean): string {
  return [
    "ds-focus-ring inline-flex h-7 flex-1 cursor-pointer items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors duration-150",
    active
      ? "bg-surface-muted text-text-primary"
      : "text-text-secondary hover:text-text-primary",
  ].join(" ");
}

export function UserMenu() {
  const t = useTranslations("controls");
  const tUsers = useTranslations("users");
  const { user, status, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (status !== "authenticated" || !user) {
    return null;
  }

  const initials = getInitials(user.firstName, user.lastName, user.username);
  const displayName = getDisplayName(
    user.firstName,
    user.lastName,
    user.username,
  );
  const roleLabel =
    user.role === "super_admin"
      ? tUsers("roleSuperAdmin")
      : tUsers("roleAdmin");

  function switchLocale(next: Locale) {
    if (next === locale) return;
    close();
    router.replace(pathname, { locale: next });
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    close();
    try {
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="ds-focus-ring inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface py-0.5 ps-1 pe-2.5 transition-colors hover:bg-surface-muted"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold tracking-wide text-primary-foreground"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden max-w-[10rem] truncate text-start text-sm font-medium leading-tight text-text-primary sm:inline">
          {displayName}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 top-[calc(100%+0.375rem)] z-50 min-w-[14rem] overflow-hidden rounded-2xl border border-border bg-surface py-1 shadow-[var(--shadow-2)]"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-text-primary">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-xs text-text-muted">
              @{user.username}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{roleLabel}</p>
          </div>

          <div className="border-b border-border px-3 py-3">
            <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
              {t("theme")}
            </p>
            <div
              className="flex gap-0.5 rounded-xl border border-border bg-surface p-0.5"
              role="group"
              aria-label={t("theme")}
            >
              <button
                type="button"
                role="menuitemradio"
                aria-checked={theme === "light"}
                className={preferenceOptionClass(theme === "light")}
                onClick={() => setTheme("light")}
              >
                {t("themeLight")}
              </button>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={theme === "dark"}
                className={preferenceOptionClass(theme === "dark")}
                onClick={() => setTheme("dark")}
              >
                {t("themeDark")}
              </button>
            </div>

            <p className="mb-1.5 mt-3 px-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
              {t("language")}
            </p>
            <div
              className="flex gap-0.5 rounded-xl border border-border bg-surface p-0.5"
              role="group"
              aria-label={t("language")}
            >
              <button
                type="button"
                role="menuitemradio"
                aria-checked={locale === "en"}
                className={preferenceOptionClass(locale === "en")}
                onClick={() => switchLocale("en")}
              >
                {t("english")}
              </button>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={locale === "ar"}
                className={preferenceOptionClass(locale === "ar")}
                onClick={() => switchLocale("ar")}
              >
                {t("arabic")}
              </button>
            </div>
          </div>

          <button
            type="button"
            role="menuitem"
            className="ds-focus-ring flex w-full cursor-pointer items-center px-4 py-2.5 text-start text-sm text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
          >
            {t("logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
