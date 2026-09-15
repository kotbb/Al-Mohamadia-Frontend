"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { SalesInvoicePeriod } from "@/app/modules/invoices/types/invoices.types";
import {
  getPeriodRangeInfo,
  shiftPeriodDate,
} from "@/app/modules/invoices/utils/period-range.util";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";

interface PeriodDatePickerProps {
  period: SalesInvoicePeriod;
  value: string;
  onChange: (value: string) => void;
}

export function PeriodDatePicker({
  period,
  value,
  onChange,
}: PeriodDatePickerProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  const rangeInfo = getPeriodRangeInfo(period, value, locale);
  const today = todayIsoDate();
  const isToday = value === today;

  const handleOpenPicker = () => {
    if (!inputRef.current) return;
    try {
      if (typeof inputRef.current.showPicker === "function") {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    } catch {
      inputRef.current.focus();
    }
  };

  const handlePrev = () => {
    onChange(shiftPeriodDate(period, value, -1));
  };

  const handleNext = () => {
    onChange(shiftPeriodDate(period, value, 1));
  };

  const handleResetToday = () => {
    onChange(today);
  };

  const periodLabel =
    period === "day"
      ? t("filterPeriodDay")
      : period === "week"
        ? t("filterPeriodWeek")
        : period === "month"
          ? t("filterPeriodMonth")
          : t("filterPeriodYear");

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label and badge */}
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-text-secondary">
        <label className="cursor-pointer" onClick={handleOpenPicker}>
          {t("filterDateLabel")} ({periodLabel})
        </label>
        <div className="flex items-center gap-2">
          {rangeInfo.badgeLabel ? (
            <span className="rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {rangeInfo.badgeLabel}
            </span>
          ) : null}
          {!isToday ? (
            <button
              type="button"
              onClick={handleResetToday}
              className="cursor-pointer text-[11px] font-medium text-primary underline underline-offset-2 hover:text-primary-hover"
            >
              {t("today")}
            </button>
          ) : null}
        </div>
      </div>

      {/* Main control container */}
      <div className="relative flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-1.5 py-1 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {/* Hidden native input with showPicker() */}
        <input
          ref={inputRef}
          type="date"
          name="periodDate"
          value={value}
          onChange={(event) => {
            if (event.target.value) {
              onChange(event.target.value);
            }
          }}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Previous period button */}
        <button
          type="button"
          onClick={handlePrev}
          title={t("prevPeriod")}
          aria-label={t("prevPeriod")}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4 rtl:rotate-180" />
        </button>

        {/* Formatted Date Range display (DD / MM / YYYY) */}
        <button
          type="button"
          onClick={handleOpenPicker}
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 px-2 py-1 text-center font-medium tabular-nums text-text-primary transition-colors hover:text-primary"
        >
          <span className="truncate text-xs sm:text-sm md:text-base">
            {rangeInfo.displayRange}
          </span>
        </button>

        <div className="flex items-center gap-0.5">
          {/* Next period button */}
          <button
            type="button"
            onClick={handleNext}
            title={t("nextPeriod")}
            aria-label={t("nextPeriod")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            <ChevronRightIcon className="h-4 w-4 rtl:rotate-180" />
          </button>

          {/* Calendar Picker Icon Button */}
          <button
            type="button"
            onClick={handleOpenPicker}
            title={t("selectDate")}
            aria-label={t("selectDate")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 12L10 8L6 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12.6667 2.66663H3.33333C2.59695 2.66663 2 3.26358 2 3.99996V13.3333C2 14.0697 2.59695 14.6666 3.33333 14.6666H12.6667C13.403 14.6666 14 14.0697 14 13.3333V3.99996C14 3.26358 13.403 2.66663 12.6667 2.66663Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 1.33337V4.00004M5.33333 1.33337V4.00004M2 6.66671H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
