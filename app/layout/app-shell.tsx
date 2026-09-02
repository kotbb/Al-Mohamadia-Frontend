import type { ReactNode } from "react";
import { GlobalHeader } from "./global-header";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  contentWidth?: "dashboard" | "comfortable";
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  contentWidth = "dashboard",
}: AppShellProps) {
  const contentClass =
    contentWidth === "comfortable"
      ? "mx-auto w-full max-w-3xl px-5 sm:px-6"
      : "mx-auto w-full max-w-[1080px] px-5 sm:px-6";

  return (
    <div className="fixed inset-0 overflow-hidden bg-background p-3 text-text-primary lg:p-4">
      <div className="flex h-full min-h-0 gap-3 lg:gap-4">
        <Sidebar />

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="px-5 pt-3 sm:px-6 lg:px-7">
            <GlobalHeader />
          </div>

          <div className={`${contentClass} pb-8 pt-8`}>
            <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
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
                <div className="flex shrink-0 items-center gap-2">{actions}</div>
              ) : null}
            </header>

            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
