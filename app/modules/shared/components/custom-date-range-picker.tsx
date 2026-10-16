"use client";

interface CustomDateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  fromLabel: string;
  toLabel: string;
}

const dateClass = "ds-focus-ring min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm tabular-nums text-text-primary hover:border-text-secondary";

export function CustomDateRangePicker({ from, to, onChange, fromLabel, toLabel }: CustomDateRangePickerProps) {
  return <div className="grid w-full grid-cols-2 gap-2 sm:min-w-[20rem]">
    <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">{fromLabel}
      <input type="date" required value={from} max={to || undefined}
        onChange={(event) => {
          const next = event.target.value;
          if (!next) return;
          onChange(next, next && (!to || next > to) ? next : to);
        }} className={dateClass} />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">{toLabel}
      <input type="date" required value={to} min={from || undefined}
        onChange={(event) => {
          const next = event.target.value;
          if (!next) return;
          onChange(next && (!from || next < from) ? next : from, next);
        }} className={dateClass} />
    </label>
  </div>;
}
