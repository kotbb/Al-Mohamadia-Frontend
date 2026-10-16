"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { InvoiceNeighbors } from "../types/invoices.types";

interface InvoiceNavigationProps {
  neighbors: InvoiceNeighbors | null;
  isCustomerSale: boolean;
  mode: "number" | "customer";
  onModeChange: (mode: "number" | "customer") => void;
}

export function InvoiceNavigation({ neighbors, isCustomerSale, mode, onModeChange }: InvoiceNavigationProps) {
  const t = useTranslations("invoices");
  const activeMode = isCustomerSale ? mode : "number";
  const previous = activeMode === "number" ? neighbors?.previousByNumberId : neighbors?.previousId;
  const next = activeMode === "number" ? neighbors?.nextByNumberId : neighbors?.nextId;
  return (
    <nav aria-label={t("invoiceNavigation")} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
      <div role="group" aria-label={t("invoiceNavigation")} className="flex flex-wrap rounded-lg bg-surface-muted p-1">
        {(["number", "customer"] as const).map((value) => (
          <button key={value} type="button" aria-pressed={activeMode === value}
            disabled={value === "customer" && !isCustomerSale} onClick={() => onModeChange(value)}
            className={`ds-focus-ring min-h-11 rounded-lg px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${activeMode === value ? "bg-surface text-primary shadow-sm" : "text-text-secondary hover:text-primary"}`}>
            {t(value === "number" ? "byInvoiceNumber" : "sameCustomer")}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2" role="group" aria-label={t(activeMode === "number" ? "byInvoiceNumber" : "sameCustomer")}>
        <NavigationArrow id={previous} mode={activeMode} backwards text={t("navigationPrevious")} label={t(activeMode === "number" ? "previousInvoice" : "previousCustomerInvoice")} />
        <NavigationArrow id={next} mode={activeMode} text={t("navigationNext")} label={t(activeMode === "number" ? "nextInvoice" : "nextCustomerInvoice")} />
      </div>
    </nav>
  );
}

function NavigationArrow({ id, mode, label, text, backwards = false }: { id?: string | null; mode: "number" | "customer"; label: string; text: string; backwards?: boolean }) {
  const classes = "ds-focus-ring inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10";
  const arrow = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5 rtl:rotate-180" aria-hidden="true"><path d={backwards ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" /></svg>;
  const content = <>{backwards ? arrow : null}<span>{text}</span>{backwards ? null : arrow}</>;
  return id ? <Link href={`/invoices/${id}?navigation=${mode}`} aria-label={label} title={label} className={classes}>{content}</Link> :
    <button type="button" disabled aria-label={label} title={label} className={`${classes} cursor-not-allowed opacity-35`}>{content}</button>;
}
