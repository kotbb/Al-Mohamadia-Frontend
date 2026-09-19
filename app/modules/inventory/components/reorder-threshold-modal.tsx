"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api/types";
import { updateItem } from "@/app/modules/items/services/items.service";
import { isCubicPricingMode, type StockItem } from "@/app/modules/inventory/types/inventory.types";

interface ReorderThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockItem | null;
  onSuccess: (message?: string) => void;
}

export function ReorderThresholdModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: ReorderThresholdModalProps) {
  const t = useTranslations("inventory");

  const [threshold, setThreshold] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setThreshold(String(item.reorderThreshold ?? 0));
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
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update threshold",
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

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BellIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {t("modalThresholdTitle")}
              </h2>
              <p className="text-xs text-text-secondary truncate max-w-[240px]">
                {item.name}
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

          <div className="rounded-xl border border-border bg-surface-muted/50 p-3 text-xs text-text-secondary">
            {t("currentThresholdLabel", {
              threshold: (item.reorderThreshold ?? 0).toLocaleString("en-US", {
                maximumFractionDigits: isCubic ? 3 : 0,
              }),
              unit: unitLabel,
            })}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="thresholdInput"
              className="block text-xs font-semibold text-text-primary"
            >
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
            <p className="text-[11px] text-text-muted">
              {t("thresholdHelper")}
            </p>
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
              disabled={isSubmitting || !isValid}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-hover shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t("submittingAdjust") : t("submitThreshold")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
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
