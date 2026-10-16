interface InvoicePrintGuidanceProps {
  title: string;
  message: string;
  className?: string;
}

export function InvoicePrintGuidance({ title, message, className = "" }: InvoicePrintGuidanceProps) {
  return (
    <aside role="note" className={`print:hidden flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text-secondary ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true">
        <path d="m12 3 10 18H2L12 3Z" strokeLinejoin="round" />
        <path d="M12 9v5m0 3v.5" strokeLinecap="round" />
      </svg>
      <div>
        <p className="font-semibold text-text-primary">{title}</p>
        <p className="mt-1">{message}</p>
      </div>
    </aside>
  );
}
