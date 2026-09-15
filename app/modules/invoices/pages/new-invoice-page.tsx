"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { InvoiceCustomerSection } from "@/app/modules/invoices/components/invoice-customer-section";
import { InvoiceLineRow } from "@/app/modules/invoices/components/invoice-line-row";
import { InvoiceTotals } from "@/app/modules/invoices/components/invoice-totals";
import { useInvoiceForm } from "@/app/modules/invoices/hooks/use-invoice-form";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

export function NewInvoicePage() {
  const t = useTranslations("invoices");
  const tShared = useTranslations("shared");
  const router = useRouter();
  const form = useInvoiceForm();

  async function handleSubmit(print: boolean) {
    const id = await form.submit({
      print,
      t: (key) => t(key as Parameters<typeof t>[0]),
    });
    if (id) {
      router.push(`/invoices/${id}`);
    }
  }

  return (
    <AppShell title={t("newTitle")} subtitle={t("newSubtitle")}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link
          href="/invoices"
          className="ds-focus-ring inline-flex w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          <BackIcon />
          {t("backToList")}
        </Link>

        {form.itemsStatus === "loading" || form.itemsStatus === "idle" ? (
          <LoadingState message={tShared("loading")} />
        ) : form.itemsStatus === "error" ? (
          <ErrorState
            title={t("listError")}
            message={form.itemsError ?? undefined}
          />
        ) : (
          <>
            <InvoiceCustomerSection
              type={form.type}
              onTypeChange={form.setSaleType}
              customerQuery={form.customerQuery}
              onCustomerQueryChange={form.setCustomerQuery}
              customerResults={form.customerResults}
              customersLoading={form.customersLoading}
              allCustomers={form.allCustomers}
              allCustomersLoading={form.allCustomersLoading}
              selectedCustomer={form.selectedCustomer}
              onSelectCustomer={form.selectCustomer}
              onSelectCustomerId={form.selectCustomerById}
              onClearCustomer={form.clearCustomer}
            />

            <SurfaceCard>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-text-primary">
                  {t("linesTitle")}
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={form.addLine}
                >
                  {t("addLine")}
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                {form.lines.map((line, index) => (
                  <InvoiceLineRow
                    key={line.key}
                    line={line}
                    items={form.items}
                    lineTotal={form.lineTotals[index] ?? 0}
                    canRemove={form.lines.length > 1}
                    onSelectItem={(itemId) => form.selectItem(line.key, itemId)}
                    onChange={(patch) => form.updateLine(line.key, patch)}
                    onRemove={() => form.removeLine(line.key)}
                  />
                ))}
              </div>
            </SurfaceCard>

            <InvoiceTotals
              total={form.totals.total}
              remaining={form.totals.remaining}
              discountInput={form.discountInput}
              paidInput={form.paidInput}
              onDiscountChange={form.setDiscountInput}
              onPaidChange={form.setPaidInput}
              paidReadOnly={form.type === "cash_sale"}
            />

            {form.submitError ? (
              <p className="text-danger" role="alert">
                {form.submitError}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-6">
              <Button
                type="button"
                variant="secondary"
                disabled={form.isSubmitting}
                onClick={() => router.push("/invoices")}
              >
                {t("modalCancel")}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={form.isSubmitting}
                onClick={() => void handleSubmit(false)}
              >
                {form.isSubmitting ? t("saving") : t("save")}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={form.isSubmitting}
                onClick={() => void handleSubmit(true)}
              >
                {form.isSubmitting ? t("saving") : t("saveAndPrint")}
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3 5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
