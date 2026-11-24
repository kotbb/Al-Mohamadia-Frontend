"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { InvoiceNeighbors, InvoiceNavigationMode } from "../types/invoices.types";

interface InvoiceNavigationProps {
  neighbors: InvoiceNeighbors | null;
  isCustomerSale: boolean;
  mode: InvoiceNavigationMode;
  onModeChange: (mode: InvoiceNavigationMode) => void;
}

export function InvoiceNavigation({ neighbors, isCustomerSale, mode, onModeChange }: InvoiceNavigationProps) {
  const t = useTranslations("invoices");
  const browseId = useId();
  const contextualMode = isCustomerSale ? "customer" : "cash";
  const activeMode = mode === contextualMode ? mode : "number";
  const contextualLabel = isCustomerSale ? "sameCustomer" : "cashSales";
  const browseOptions = [["number", "byInvoiceNumber"], [contextualMode, contextualLabel]] as const;
  const previous =
    activeMode === "number"
      ? neighbors?.previousByNumberId
      : activeMode === "cash"
        ? neighbors?.previousCashId
        : neighbors?.previousId;
  const next =
    activeMode === "number"
      ? neighbors?.nextByNumberId
      : activeMode === "cash"
        ? neighbors?.nextCashId
        : neighbors?.nextId;
  return (
    <nav aria-label={t("invoiceNavigation")} className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="radiogroup"
        aria-labelledby={browseId}
        className="flex w-full min-w-0 flex-wrap items-start gap-2 sm:w-auto sm:items-center sm:gap-3"
      >
        <span id={browseId} className="w-full text-sm font-medium text-text-secondary sm:w-auto">
          {t("browse")}
        </span>
        <div className="grid w-full grid-cols-2 gap-1 rounded-xl border border-border bg-surface-muted p-1 sm:inline-flex sm:w-auto">
          {browseOptions.map(([value, label]) => (
            <label key={value} className="flex min-w-0 cursor-pointer">
              <input
                type="radio"
                name={browseId}
                value={value}
                checked={activeMode === value}
                onChange={() => onModeChange(value)}
                className="peer sr-only"
              />
              <span className="flex min-h-11 w-full items-center justify-center rounded-lg border border-transparent px-3 py-2 text-center text-sm leading-snug font-medium text-text-secondary hover:text-text-primary peer-checked:border-border peer-checked:bg-surface peer-checked:font-semibold peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring forced-colors:peer-checked:border-[Highlight]">
                {t(label)}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label={t(activeMode === "number" ? "byInvoiceNumber" : contextualLabel)}
      >
        <NavigationArrow
          id={previous}
          mode={activeMode}
          backwards
          text={t("navigationPrevious")}
          label={t(
            activeMode === "number"
              ? "previousInvoice"
              : activeMode === "cash"
                ? "previousCashInvoice"
                : "previousCustomerInvoice",
          )}
        />
        <NavigationArrow
          id={next}
          mode={activeMode}
          text={t("navigationNext")}
          label={t(
            activeMode === "number" ? "nextInvoice" : activeMode === "cash" ? "nextCashInvoice" : "nextCustomerInvoice",
          )}
        />
      </div>
    </nav>
  );
}

function NavigationArrow({
  id,
  mode,
  label,
  text,
  backwards = false,
}: {
  id?: string | null;
  mode: InvoiceNavigationMode;
  label: string;
  text: string;
  backwards?: boolean;
}) {
  const classes =
    "ds-focus-ring inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10";
  const arrow = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="size-5 rtl:rotate-180"
      aria-hidden="true"
    >
      <path d={backwards ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const content = (
    <>
      {backwards ? arrow : null}
      <span>{text}</span>
      {backwards ? null : arrow}
    </>
  );
  return id ? (
    <Link
      replace
      data-navigation-replace="true"
      href={`/invoices/${id}?navigation=${mode}`}
      aria-label={label}
      title={label}
      className={classes}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      disabled
      aria-label={label}
      title={label}
      className={`${classes} cursor-not-allowed opacity-35`}
    >
      {content}
    </button>
  );
}
