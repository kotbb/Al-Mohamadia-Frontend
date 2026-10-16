"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { GlobalHeader } from "./global-header";
import { HubNavigation } from "./hub-navigation";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  hubTabs?: ReactNode | false;
  contentWidth?: "dashboard" | "comfortable";
  density?: "default" | "compact";
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  hubTabs,
  contentWidth = "dashboard",
  density = "default",
}: AppShellProps) {
  const contentClass =
    contentWidth === "comfortable"
      ? "mx-auto w-full max-w-3xl px-5 sm:px-6"
      : "mx-auto w-full max-w-[1080px] px-5 sm:px-6";
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const navOpen = openPath === pathname;
  const tNav = useTranslations("nav");

  useEffect(() => {
    if (!navOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background p-3 text-text-primary lg:p-4">
      <div className="flex h-full min-h-0 gap-3 lg:gap-4">
        <div className="hidden h-full lg:block">
          <Sidebar />
        </div>

        {navOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 cursor-default bg-black/40"
              aria-label={tNav("closeMenu")}
              onClick={() => setOpenPath(null)}
            />
            <div className="absolute inset-y-3 start-3 z-10 w-56">
              <Sidebar onNavigate={() => setOpenPath(null)} />
            </div>
          </div>
        ) : null}

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="px-5 pt-3 sm:px-6 lg:px-7">
            <GlobalHeader onOpenNav={() => setOpenPath(pathname)} />
          </div>

          <div
            className={`${contentClass} pb-8 ${density === "compact" ? "pt-4" : "pt-8"}`}
          >
            {hubTabs === false ? null : hubTabs !== undefined ? (
              <div className={density === "compact" ? "mb-4" : "mb-6"}>
                {hubTabs}
              </div>
            ) : (
              <div className={density === "compact" ? "mb-4" : "mb-6"}>
                <HubNavigation />
              </div>
            )}

            <header
              className={`${density === "compact" ? "mb-3" : "mb-5"} flex flex-wrap items-start justify-between gap-3`}
            >
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-text-primary">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-0.5 text-sm leading-snug text-text-secondary">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              {actions ? (
                <div className="flex flex-wrap items-center gap-2">
                  {actions}
                </div>
              ) : null}
            </header>

            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
