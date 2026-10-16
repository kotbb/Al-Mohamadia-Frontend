"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { PurchaseLineRow } from "@/app/modules/purchases/components/purchase-line-row";
import { PurchaseSupplierSection } from "@/app/modules/purchases/components/purchase-supplier-section";
import { PurchaseTotals } from "@/app/modules/purchases/components/purchase-totals";
import { usePurchaseForm } from "@/app/modules/purchases/hooks/use-purchase-form";
import { AddInvoiceLineButton } from "@/app/modules/invoices/components/add-invoice-line-button";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

export function NewPurchasePage() {
  const t = useTranslations("purchases");
  const tShared = useTranslations("shared");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSupplierId = searchParams.get("supplierId");

  const form = usePurchaseForm({ initialSupplierId });

  async function handleSubmit() {
    const id = await form.submit({
      t: (key) => t(key as Parameters<typeof t>[0]),
    });
    if (id) {
      router.push(`/purchases/${id}`);
    }
  }

  return (
    <AppShell
      title={t("newTitle")}
      subtitle={t("newSubtitle")}
      density="compact"
      actions={
        <Link
          href="/purchases"
          className="ds-focus-ring inline-flex w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          <BackIcon />
          <span>{t("backToList")}</span>
        </Link>
      }
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        {form.itemsStatus === "loading" || form.itemsStatus === "idle" ? (
          <LoadingState message={tShared("loading")} />
        ) : form.itemsStatus === "error" ? (
          <ErrorState
            title={t("listError")}
            message={form.itemsError ?? undefined}
          />
        ) : (
          <>
            {/* Supplier Section */}
            <PurchaseSupplierSection
              allSuppliers={form.allSuppliers}
              allSuppliersLoading={form.allSuppliersLoading}
              selectedSupplier={form.selectedSupplier}
              onSelectSupplierId={form.selectSupplierById}
              onClearSupplier={form.clearSupplier}
              notes={form.notes}
              onNotesChange={form.setNotes}
            />

            {/* Lines Section */}
            <SurfaceCard padding="sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-text-primary">
                  {t("linesTitle")}
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                {form.lines.map((line, index) => (
                  <PurchaseLineRow
                    key={line.key}
                    line={line}
                    items={form.items}
                    lineTotal={form.lineTotals[index] ?? 0}
                    canRemove={form.lines.length > 1}
                    onSelectItem={(itemId) => form.selectItem(line.key, itemId)}
                    onChange={(patch) => form.updateLine(line.key, patch)}
                    onDuplicate={() => form.duplicateLine(line.key)}
                    onRemove={() => form.removeLine(line.key)}
                    onAddDimensionDefault={(dimension, value) =>
                      form.addDimensionDefault(
                        line.key,
                        line.itemId,
                        dimension,
                        value,
                      )
                    }
                  />
                ))}
              </div>
              <AddInvoiceLineButton
                label={t("addLine")}
                onClick={form.addLine}
              />
            </SurfaceCard>

            {/* Totals Section */}
            <PurchaseTotals
              total={form.total}
              paidInput={form.paidInput}
              onPaidChange={form.setPaidInput}
              remaining={form.remaining}
              totalDue={form.totalDue}
              supplierBalance={form.selectedSupplier?.amountOwed}
            />

            {form.submitError ? (
              <p className="text-sm text-danger" role="alert">
                {form.submitError}
              </p>
            ) : null}

            {/* Bottom Actions */}
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-6">
              <Button
                type="button"
                variant="secondary"
                disabled={form.isSubmitting}
                onClick={() => router.push("/purchases")}
              >
                {t("modalCancel")}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={form.isSubmitting}
                onClick={() => void handleSubmit()}
              >
                {form.isSubmitting ? t("saving") : t("save")}
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
