"use client";

import { Link, usePathname } from "@/i18n/navigation";

export interface HubTabItem {
  key: string;
  label: string;
  href: string;
}

interface HubTabsProps {
  tabs: HubTabItem[];
  className?: string;
}

export function HubTabs({ tabs, className = "" }: HubTabsProps) {
  const pathname = usePathname();

  return (
    <div className={`flex items-center overflow-x-auto pb-1 ${className}`}>
      <nav
        className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-muted p-1"
        aria-label="Hub navigation"
      >
        {tabs.map((tab) => {
          // Exact match or sub-route match
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(`${tab.href}/`)) ||
            (tab.href !== "/" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`ds-focus-ring flex min-h-11 items-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-surface text-text-primary font-semibold"
                  : "text-text-secondary hover:bg-surface/60 hover:text-text-primary"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
