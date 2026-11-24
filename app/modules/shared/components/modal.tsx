"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAppNavigation } from "../hooks/use-app-navigation";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onRestore?: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl" | "wide";
  /** Inactive parent dialogs retain local state without interacting with the page. */
  active?: boolean;
  nested?: boolean;
  busy?: boolean;
  history?: boolean;
  layerKey?: string;
}

const activeDialogs: string[] = [];
let scrollLocks = 0;
let previousOverflow = "";

export function Modal({
  open,
  onClose,
  onRestore,
  title,
  children,
  footer,
  size = "md",
  active = true,
  nested = false,
  busy = false,
  history = true,
  layerKey,
}: ModalProps) {
  const tShared = useTranslations("shared");
  const { openLayer, registerGuard, back, request } = useAppNavigation();
  const titleId = useId();
  const key = layerKey ?? `modal:${titleId}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);
  const callbacks = useRef({ onClose, onRestore, busy });
  useEffect(() => {
    callbacks.current = { onClose, onRestore, busy };
  });

  useEffect(() => {
    if (!open || !history) return;
    return openLayer(
      key,
      () => callbacks.current.onClose(),
      () => callbacks.current.onRestore?.(),
    );
  }, [open, history, key, openLayer]);

  useEffect(() => {
    if (!open) return;
    return registerGuard(`modal-busy:${key}`, { dirty: false, busy, layerKey: key });
  }, [open, busy, key, registerGuard]);

  const requestClose = useCallback(() => {
    if (callbacks.current.busy) return;
    if (history) back();
    else request(() => callbacks.current.onClose());
  }, [history, back, request]);

  useEffect(() => {
    if (!open || !active) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    activeDialogs.push(key);
    if (scrollLocks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    if (contentRef.current) contentRef.current.scrollTop = scrollTop.current;
    panelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (activeDialogs.at(-1) !== key || document.querySelector("[data-discard-dialog]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;
      const targets = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const first = targets[0],
        last = targets.at(-1);
      if (!first) {
        event.preventDefault();
        panelRef.current?.focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !panelRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      const index = activeDialogs.lastIndexOf(key);
      if (index >= 0) activeDialogs.splice(index, 1);
      if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, active, key, requestClose]);

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
      className={`${active ? "flex" : "hidden"} fixed inset-0 z-50 items-center justify-center p-4`}
      role="presentation"
      inert={!active}
    >
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 cursor-default ds-scrim"
        aria-label={tShared("closeDialog")}
        disabled={busy}
        onClick={requestClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={active ? "true" : undefined}
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-10 flex w-full ${sizeClass} flex-col overflow-hidden rounded-xl border border-border bg-surface ds-elevation-2`}
      >
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
          <button
            type="button"
            disabled={busy}
            onClick={requestClose}
            aria-label={tShared(nested ? "back" : "close")}
            title={tShared(nested ? "back" : "close")}
            className={`ds-focus-ring group inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-50 ${nested ? "border border-border hover:bg-surface-muted" : ""}`}
          >
            {nested ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="size-5 rtl:rotate-180"
                aria-hidden="true"
              >
                <path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-text-secondary group-hover:bg-surface-muted">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </button>
          <h2 id={titleId} className="min-w-0 text-lg font-semibold text-text-primary">
            {title}
          </h2>
        </div>
        <div
          ref={contentRef}
          onScroll={(event) => {
            scrollTop.current = event.currentTarget.scrollTop;
          }}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
        >
          {children}
        </div>
        {footer ? <div className="shrink-0 border-t border-border px-5 py-3.5">{footer}</div> : null}
      </div>
    </div>
  );
}
