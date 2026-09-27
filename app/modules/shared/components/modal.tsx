"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Tailwind max-width class; default max-w-lg */
  size?: "md" | "lg" | "xl" | "wide";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onCloseRef.current();
    }
  }, []);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the dialog only when it first opens — never on every parent re-render
    if (!wasOpenRef.current) {
      panelRef.current?.focus();
      wasOpenRef.current = true;
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const sizeClass =
    size === "wide"
      ? "max-w-6xl max-h-[min(92vh,52rem)]"
      : size === "xl"
        ? "max-w-4xl max-h-[min(92vh,52rem)]"
        : size === "lg"
          ? "max-w-xl max-h-[min(90vh,44rem)]"
          : "max-w-lg max-h-[min(90vh,40rem)]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-10 flex w-full ${sizeClass} flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lg`}
      >
        <div className="shrink-0 border-b border-border px-5 py-3.5">
          <h2 id={titleId} className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-border px-5 py-3.5">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
