"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

interface NavItem {
  key:
    | "home"
    | "newInvoice"
    | "invoices"
    | "customers"
    | "inventory"
    | "suppliers"
    | "items"
    | "users";
  href?: string;
  enabled: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "/", enabled: true },
  { key: "newInvoice", enabled: false },
  { key: "invoices", enabled: false },
  { key: "customers", enabled: false },
  { key: "inventory", enabled: false },
  { key: "suppliers", enabled: false },
  { key: "items", enabled: false },
  { key: "users", enabled: false },
];

function NavIcon({ name }: { name: NavItem["key"] }) {
  const common = "h-5 w-5 shrink-0";
  switch (name) {
    case "home":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "newInvoice":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 3h6l4 4v14H8V3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M14 3v4h4M12 11v6M9 14h6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "invoices":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 3h8l4 4v14H7V3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M15 3v4h4M10 12h6M10 16h6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "customers":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
          <circle
            cx="16.5"
            cy="9"
            r="2.25"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M3.5 19c.8-2.8 3-4.5 5.5-4.5s4.7 1.7 5.5 4.5M14 14.7c1.4-.4 2.9.1 4 1.3.7.8 1.1 1.7 1.3 2.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "inventory":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M4 8.5 12 13l8-4.5M12 13v7"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      );
    case "suppliers":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 16V8h11v8H3Zm11 0h4l3 3v-5h-3l-2-3h-2v5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="18" r="1.75" fill="currentColor" />
          <circle cx="16.5" cy="18" r="1.75" fill="currentColor" />
        </svg>
      );
    case "items":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 12 20 7.5M12 12 4 7.5M12 12v9"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      );
    case "users":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle
            cx="12"
            cy="8"
            r="3.25"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M5 19c1-3 3.5-4.5 7-4.5s6 1.5 7 4.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle
            cx="18"
            cy="7"
            r="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar() {
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-ink text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xl font-bold tracking-tight text-accent">
          {tApp("name")}
        </p>
        <p className="mt-1 text-sm text-white/60">{tApp("tagline")}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const label = t(item.key);
          const isActive =
            item.enabled && item.href !== undefined && pathname === item.href;

          const className = `flex min-h-11 items-center gap-3 rounded-lg px-3 text-base transition-colors duration-150 ${
            isActive
              ? "bg-primary text-primary-foreground"
              : item.enabled
                ? "text-white/90 hover:bg-white/10"
                : "cursor-not-allowed text-white/40"
          }`;

          if (item.enabled && item.href) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className={className}
                aria-current={isActive ? "page" : undefined}
              >
                <NavIcon name={item.key} />
                <span>{label}</span>
              </Link>
            );
          }

          return (
            <span
              key={item.key}
              className={className}
              title={t("comingSoon")}
              aria-disabled="true"
            >
              <NavIcon name={item.key} />
              <span>{label}</span>
            </span>
          );
        })}
      </nav>
    </aside>
  );
}
