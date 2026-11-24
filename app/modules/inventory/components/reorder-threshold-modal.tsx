"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useState } from "react";
import { Modal } from "@/app/modules/shared/components/modal";
import { useAppNavigation } from "@/app/modules/shared/hooks/use-app-navigation";
import { useLeaveGuard } from "@/app/modules/shared/hooks/use-leave-guard";
import { useTranslations } from "next-intl";
import { updateItem } from "@/app/modules/items/services/items.service";
import { isCubicPricingMode, type StockItem } from "@/app/modules/inventory/types/inventory.types";

interface ReorderThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore?: () => void;
  item: StockItem | null;
  onSuccess: (message?: string) => void;
}

export function ReorderThresholdModal({ isOpen, onClose, onRestore, item, onSuccess }: ReorderThresholdModalProps) {
  const describeError = useApiErrorMessage();
  const navigation = useAppNavigation();
  const [initialized, setInitialized] = useState<string | null>(null);
  const t = useTranslations("inventory");

  const [threshold, setThreshold] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const session = isOpen && item ? item.id : null;
  if (initialized !== session) {
    setInitialized(session);
    if (item) {
      setThreshold(String(item.reorderThreshold ?? 0));

      setError(null);
    }
  }

  useLeaveGuard({
    dirty: !!item && initialized === item.id && threshold !== String(item.reorderThreshold ?? 0),
    busy: isSubmitting,
    enabled: isOpen,
  });

  if (!isOpen || !item) return null;

  const isCubic = isCubicPricingMode(item.pricingMode);
  const unitLabel = isCubic ? t("unitCubicMeter") : t("unitPiece");
  const parsedVal = parseFloat(threshold);
  const isValid = !isNaN(parsedVal) && isFinite(parsedVal) && parsedVal >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateItem(item.id, {
        reorderThreshold: parsedVal,
      });
      onSuccess(t("thresholdSuccess"));
      onClose();
    } catch (err: unknown) {
      setError(describeError(err, "Failed to update threshold"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      layerKey="inventory:reorder-threshold-modal"
      open={isOpen}
      onClose={onClose}
      onRestore={onRestore}
      busy={isSubmitting}
      title={t("modalThresholdTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface-muted/50 p-3 text-xs text-text-secondary">
          {t("currentThresholdLabel", {
            threshold: (item.reorderThreshold ?? 0).toLocaleString("en-US", {
              maximumFractionDigits: isCubic ? 3 : 0,
            }),
            unit: unitLabel,
          })}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="thresholdInput" className="block text-xs font-semibold text-text-primary">
            {t("newThresholdLabel", { unit: unitLabel })}
          </label>
          <input
            id="thresholdInput"
            type="number"
            step={isCubic ? "0.001" : "1"}
            min="0"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base font-semibold tabular-nums text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="0"
          />
          <p className="text-[11px] text-text-muted">{t("thresholdHelper")}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => navigation.back()}
            disabled={isSubmitting}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-muted transition-colors disabled:opacity-50"
          >
            {t("modalCancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="ds-focus-ring min-h-11 rounded-lg bg-primary px-5 py-2 text-base font-medium text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t("submittingAdjust") : t("submitThreshold")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
