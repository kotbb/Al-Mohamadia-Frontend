"use client";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label?: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <span className="text-base font-medium text-text-secondary">{label}</span>
      ) : null}
      <div className="w-full overflow-x-auto">
        <div
          className="inline-flex min-w-full rounded-xl border border-border bg-surface-muted p-1"
          role="radiogroup"
          aria-label={label}
        >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`ds-focus-ring min-h-9 shrink-0 cursor-pointer rounded-lg px-3.5 sm:px-4 text-sm font-medium whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? "bg-surface text-text-primary shadow-sm"
                  : "bg-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {option.label}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
