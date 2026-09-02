"use client";

import { useEffect, useState } from "react";

const MOTION_MS = 380;

type Phase = "closed" | "entering" | "shown" | "leaving";

interface ToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
  durationMs?: number;
  variant?: "success" | "danger";
}

export function Toast({
  message,
  open,
  onClose,
  durationMs = 3200,
  variant = "success",
}: ToastProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [displayMessage, setDisplayMessage] = useState(message);
  const [displayVariant, setDisplayVariant] = useState(variant);

  useEffect(() => {
    if (!open) {
      setPhase((current) =>
        current === "closed" || current === "leaving" ? current : "leaving",
      );
      return;
    }

    setDisplayMessage(message);
    setDisplayVariant(variant);
    setPhase("entering");

    const showTimer = window.setTimeout(() => {
      setPhase("shown");
    }, 40);

    return () => window.clearTimeout(showTimer);
  }, [open, message, variant]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(() => setPhase("closed"), MOTION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "shown") return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [phase, onClose, durationMs, displayMessage, displayVariant]);

  if (phase === "closed") return null;

  const isShown = phase === "shown";
  const tone =
    displayVariant === "danger"
      ? "border-danger/30 bg-danger/12 text-danger"
      : "border-success/30 bg-success/12 text-success";

  return (
    <div
      className={`ds-elevation-1 pointer-events-none fixed top-24 end-4 z-50 min-w-[16rem] max-w-md rounded-xl border bg-surface px-5 py-3.5 text-base font-medium ${tone}`}
      data-allow-motion=""
      style={{
        opacity: isShown ? 1 : 0,
        transform: isShown
          ? "translate3d(0, 0, 0) scale(1)"
          : "translate3d(0, -18px, 0) scale(0.94)",
        transitionProperty: "opacity, transform",
        transitionDuration: `${MOTION_MS}ms`,
        transitionTimingFunction: isShown
          ? "cubic-bezier(0.22, 1, 0.36, 1)"
          : "cubic-bezier(0.4, 0, 1, 1)",
        willChange: "opacity, transform",
      }}
      role="status"
      aria-live="polite"
    >
      {displayMessage}
    </div>
  );
}
