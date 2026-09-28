"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createStockAdjustment } from "@/app/modules/inventory/services/inventory.service";
import { isCubicPricingMode, type StockItem } from "@/app/modules/inventory/types/inventory.types";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockItem | null;
  onSuccess: (message?: string) => void;
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: StockAdjustmentModalProps) {
  const describeError = useApiErrorMessage();
  const t = useTranslations("inventory");

  const [newQuantity, setNewQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setNewQuantity(String(item.stockQuantity));
      setReason("");
      setError(null);
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

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
      setError(
        describeError(err, t("adjustError")),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {t("modalAdjustTitle")}
              </h2>
              <p className="text-xs text-text-secondary">
                {t("modalAdjustSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label={t("modalClose")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors disabled:opacity-50"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <label
              htmlFor="newQuantityInput"
              className="block text-xs font-semibold text-text-primary"
            >
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
                    diff: (diff > 0 ? `+${diff}` : `${diff}`),
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
            <label className="block text-xs font-semibold text-text-secondary">
              {t("reasonPresetsLabel")}
            </label>
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
            <label
              htmlFor="reasonTextarea"
              className="block text-xs font-semibold text-text-primary"
            >
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
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-muted transition-colors disabled:opacity-50"
            >
              {t("modalCancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDiffZero || !reason.trim()}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-hover shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t("submittingAdjust") : t("submitAdjust")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
