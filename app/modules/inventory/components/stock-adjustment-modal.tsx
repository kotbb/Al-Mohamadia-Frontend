"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useState } from "react";
import { Modal } from "@/app/modules/shared/components/modal";
import { useAppNavigation } from "@/app/modules/shared/hooks/use-app-navigation";
import { useLeaveGuard } from "@/app/modules/shared/hooks/use-leave-guard";
import { useTranslations } from "next-intl";
import { createStockAdjustment } from "@/app/modules/inventory/services/inventory.service";
import { isCubicPricingMode, type StockItem } from "@/app/modules/inventory/types/inventory.types";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore?: () => void;
  item: StockItem | null;
  onSuccess: (message?: string) => void;
}

export function StockAdjustmentModal({ isOpen, onClose, onRestore, item, onSuccess }: StockAdjustmentModalProps) {
  const describeError = useApiErrorMessage();
  const navigation = useAppNavigation();
  const [initialized, setInitialized] = useState<string | null>(null);
  const t = useTranslations("inventory");

  const [newQuantity, setNewQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const session = isOpen && item ? item.id : null;
  if (initialized !== session) {
    setInitialized(session);
    if (item) {
      setNewQuantity(String(item.stockQuantity));
      setReason("");
      setError(null);
    }
  }

  useLeaveGuard({
    dirty: !!item && initialized === item.id && (newQuantity !== String(item.stockQuantity) || reason !== ""),
    busy: isSubmitting,
    enabled: isOpen,
  });

  if (!isOpen || !item) return null;

  const isCubic = isCubicPricingMode(item.pricingMode);
  const unitLabel = isCubic ? t("unitCubicMeter") : t("unitPiece");
  const parsedNewQty = parseFloat(newQuantity);
  const isValidNum = !isNaN(parsedNewQty) && isFinite(parsedNewQty);
  const diff = isValidNum ? parsedNewQty - item.stockQuantity : 0;
  const isDiffZero = isValidNum && Math.abs(diff) < 0.000001;

  const presets = [
    { label: t("presetDeficit"), text: t("presetDeficit") },
    { label: t("presetSurplus"), text: t("presetSurplus") },
    { label: t("presetDamaged"), text: t("presetDamaged") },
    { label: t("presetStorage"), text: t("presetStorage") },
    { label: t("presetCorrection"), text: t("presetCorrection") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNum) return;

    if (isDiffZero) {
      setError(t("adjustSameQuantityError"));
      return;
    }

    if (!reason.trim() || reason.trim().length < 3) {
      setError(t("adjustReasonRequiredError"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createStockAdjustment({
        itemId: item.id,
        newQuantity: parsedNewQty,
        reason: reason.trim(),
      });
      onSuccess(t("adjustSuccess"));
      onClose();
    } catch (err: unknown) {
      setError(describeError(err, t("adjustError")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      layerKey="inventory:stock-adjustment-modal"
      open={isOpen}
      onClose={onClose}
      onRestore={onRestore}
      busy={isSubmitting}
      title={t("modalAdjustTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        {/* Item details card */}
        <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-text-primary">{item.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>{item.category?.name || "-"}</span>
            <span className="font-semibold text-text-primary">
              {t("currentStockLabel", {
                quantity: item.stockQuantity.toLocaleString("en-US", {
                  maximumFractionDigits: isCubic ? 3 : 0,
                }),
                unit: unitLabel,
              })}
            </span>
          </div>
        </div>

        {/* New Quantity Input */}
        <div className="space-y-1.5">
          <label htmlFor="newQuantityInput" className="block text-xs font-semibold text-text-primary">
            {t("newQuantityLabel", { unit: unitLabel })}
          </label>
          <input
            id="newQuantityInput"
            type="number"
            step={isCubic ? "0.001" : "1"}
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base font-semibold tabular-nums text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="0"
          />

          {/* Calculated Difference Badge */}
          {isValidNum && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-text-secondary">
                {t("quantityDifference", {
                  diff: diff > 0 ? `+${diff}` : `${diff}`,
                  unit: unitLabel,
                })}
              </span>
              {isDiffZero ? (
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-surface-muted text-text-secondary border border-border">
                  {t("statusNormal")}
                </span>
              ) : diff > 0 ? (
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-success/10 text-success border border-success/30">
                  +{diff.toFixed(isCubic ? 3 : 0)} {unitLabel} ({t("diffSurplus")})
                </span>
              ) : (
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-danger/10 text-danger border border-danger/30">
                  {diff.toFixed(isCubic ? 3 : 0)} {unitLabel} ({t("diffDeficit")})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reason Presets */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">{t("reasonPresetsLabel")}</label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.text}
                type="button"
                onClick={() => setReason(preset.text)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  reason === preset.text
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-surface hover:bg-surface-muted text-text-secondary hover:text-text-primary"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Field */}
        <div className="space-y-1.5">
          <label htmlFor="reasonTextarea" className="block text-xs font-semibold text-text-primary">
            {t("reasonFieldLabel")}
          </label>
          <textarea
            id="reasonTextarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            required
            minLength={3}
            maxLength={500}
            placeholder={t("reasonFieldPlaceholder")}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
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
            disabled={isSubmitting || isDiffZero || !reason.trim()}
            className="ds-focus-ring min-h-11 rounded-lg bg-primary px-5 py-2 text-base font-medium text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t("submittingAdjust") : t("submitAdjust")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
