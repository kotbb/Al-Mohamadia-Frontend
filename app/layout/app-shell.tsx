import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { HeaderControls } from "./header-controls";

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-surface px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-base text-text-muted">{subtitle}</p>
            ) : null}
          </div>
          <HeaderControls />
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
