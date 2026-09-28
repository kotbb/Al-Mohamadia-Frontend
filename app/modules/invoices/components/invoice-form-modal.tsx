"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { InvoiceCustomerSection } from "@/app/modules/invoices/components/invoice-customer-section";
import { InvoiceLineRow } from "@/app/modules/invoices/components/invoice-line-row";
import { InvoiceTotals } from "@/app/modules/invoices/components/invoice-totals";
import type { useInvoiceForm } from "@/app/modules/invoices/hooks/use-invoice-form";

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  form: ReturnType<typeof useInvoiceForm>;
  onSuccess: (createdId: string, printed: boolean) => void;
}

export function InvoiceFormModal({
  open,
  onClose,
  form,
  onSuccess,
}: InvoiceFormModalProps) {
  const t = useTranslations("invoices");
  const tShared = useTranslations("shared");

  async function handleSubmit(print: boolean) {
    const id = await form.submit({
      print,
      t: (key) => t(key as Parameters<typeof t>[0]),
    });
    if (id) {
      onSuccess(id, print);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        form.isEdit
          ? t("editTitle", { number: form.invoiceNumber ?? "" })
          : t("newTitle")
      }
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
            onClick={() => void handleSubmit(false)}
          >
            {form.isSubmitting
              ? form.isEdit
                ? t("updating")
                : t("saving")
              : form.isEdit
                ? t("saveChanges")
                : t("save")}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={form.isSubmitting}
            onClick={() => void handleSubmit(true)}
          >
            <PrinterIcon />
            {form.isSubmitting
              ? form.isEdit
                ? t("updating")
                : t("saving")
              : form.isEdit
                ? t("saveChangesAndPrint")
                : t("saveAndPrint")}
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

            {form.inactiveItemNames.length > 0 ? (
              <div
                className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3.5 text-sm"
                role="alert"
              >
                <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold text-text-primary">
                    {t("inactiveItemsWarningTitle")}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t("inactiveItemsWarningDesc", {
                      names: form.inactiveItemNames.join("، "),
                    })}
                  </p>
                </div>
              </div>
            ) : null}

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
                  {t("addLine")}
                </Button>
              </div>

              <div className="flex flex-col gap-3">
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
            </div>

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

function PrinterIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M6 14h12v7H6v-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function WarningIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
