"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/auth-provider";
import { AppHistory } from "../utils/app-history";
import type { AppNavigation } from "../types/navigation.types";
import { NavigationContext } from "./navigation-context";
import { Button } from "./button";

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const locale = useLocale();
  const { user } = useAuth();
  const userId = user?.id;
  const t = useTranslations("navigation");
  const [history, setHistory] = useState<AppHistory | null>(null);
  const [confirmation, setConfirmation] = useState<{ proceed: () => void; stay: () => void } | null>(null);
  useEffect(() => {
    if (!userId) return;
    const controller = new AppHistory(
      window,
      userId,
      (href, replace) => {
        if (replace) router.replace(href);
        else router.push(href);
      },
      (proceed, stay) => setConfirmation({ proceed, stay }),
      (href) => (/^\/(ar|en)(\/|\?|#|$)/.test(href) ? href : `/${locale}${href === "/" ? "" : href}`),
    );
    setHistory(controller);
    return () => {
      controller.dispose();
    };
  }, [router, userId, locale]);
  useEffect(() => {
    if (!history) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(history.reconcileLayers);
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [history]);
  useEffect(() => {
    history?.commit();
  }, [history, pathname, query]);
  const value = useMemo<AppNavigation | null>(() => {
    if (!history) return null;
    const localize = (href: string) =>
      /^\/(ar|en)(\/|\?|#|$)/.test(href) ? href : `/${locale}${href === "/" ? "" : href}`;
    return {
      push: (href) => history.push(localize(href)),
      replace: (href) => history.replace(localize(href)),
      complete: (href) => history.complete(localize(href)),
      back: (fallback) => history.back(localize(fallback ?? "/")),
      request: history.request,
      dismiss: history.dismiss,
      retireLayers: history.retireLayers,
      holdRestoration: history.holdRestoration,
      registerGuard: history.registerGuard,
      openLayer: history.openLayer,
    };
  }, [history, locale]);
  useEffect(() => {
    if (!confirmation) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = document.querySelector<HTMLElement>("[data-discard-dialog]");
    panel?.focus();
    function keydown(event: KeyboardEvent) {
      event.stopImmediatePropagation();
      if (event.key === "Escape") {
        confirmation?.stay();
        setConfirmation(null);
      }
      if (event.key === "Tab" && panel) {
        const buttons = Array.from(panel.querySelectorAll<HTMLButtonElement>("button"));
        const first = buttons[0],
          last = buttons.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener("keydown", keydown, true);
    return () => {
      window.removeEventListener("keydown", keydown, true);
      previous?.focus();
    };
  }, [confirmation]);
  return (
    <NavigationContext.Provider value={value}>
      {children}
      {confirmation ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div
            data-discard-dialog
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="discard-title"
            aria-describedby="discard-description"
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-lg"
          >
            <h2 id="discard-title" className="text-lg font-semibold text-text-primary">
              {t("discardTitle")}
            </h2>
            <p id="discard-description" className="mt-2 text-text-secondary">
              {t("discardDescription")}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  confirmation.stay();
                  setConfirmation(null);
                }}
              >
                {t("keepEditing")}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  confirmation.proceed();
                  setConfirmation(null);
                }}
              >
                {t("discardChanges")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </NavigationContext.Provider>
  );
}
