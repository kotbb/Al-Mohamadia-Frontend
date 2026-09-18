"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { PurchaseSupplierSection } from "@/app/modules/purchases/components/purchase-supplier-section";
import { PurchaseLineRow } from "@/app/modules/purchases/components/purchase-line-row";
import { PurchaseTotals } from "@/app/modules/purchases/components/purchase-totals";
import type { usePurchaseForm } from "@/app/modules/purchases/hooks/use-purchase-form";

interface PurchaseFormModalProps {
  open: boolean;
  onClose: () => void;
  form: ReturnType<typeof usePurchaseForm>;
  onSuccess: (createdId: string) => void;
}

export function PurchaseFormModal({
  open,
  onClose,
  form,
  onSuccess,
}: PurchaseFormModalProps) {
  const t = useTranslations("purchases");
  const tShared = useTranslations("shared");

  async function handleSubmit() {
    const id = await form.submit({
      t: (key) => t(key as Parameters<typeof t>[0]),
    });
    if (id) {
      onSuccess(id);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("newTitle")}
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={form.isSubmitting}
            onClick={onClose}
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
      }
    >
      <div className="flex flex-col gap-6">
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
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {t("linesTitle")}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {t("validationLines")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={form.addLine}
                >
                  <PlusIcon />
                  <span>{t("addLine")}</span>
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {form.lines.map((line, index) => (
                  <PurchaseLineRow
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

                <button
                  type="button"
                  onClick={form.addLine}
                  className="ds-focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:bg-surface-muted hover:text-primary"
                >
                  <PlusIcon />
                  <span>{t("addLine")}</span>
                </button>
              </div>
            </div>

            {/* Totals Section */}
            <PurchaseTotals
              total={form.total}
              paidInput={form.paidInput}
              onPaidChange={form.setPaidInput}
              remaining={form.remaining}
            />

            {form.submitError ? (
              <div
                className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
                role="alert"
              >
                {form.submitError}
              </div>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
