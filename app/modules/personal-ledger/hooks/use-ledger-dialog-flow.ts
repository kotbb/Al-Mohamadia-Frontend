"use client";

import { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { NavigationContext } from "@/app/modules/shared/components/navigation-context";
import { useAuth } from "@/lib/auth/auth-provider";
import type { LedgerDialog, LedgerDialogInput } from "../types/ledger-dialog-flow.types";
import { ledgerDialogFlow } from "../utils/ledger-dialog-flow";
import { ledgerDialogSession, parseLedgerDialogSession } from "../utils/ledger-dialog-session";
import { getPersonalLedgerMovement } from "../services/personal-ledger.service";

export function useLedgerDialogFlow() {
  const { user } = useAuth();
  const navigation = useContext(NavigationContext);
  const [flow, dispatch] = useReducer(ledgerDialogFlow, { entries: [], position: -1 });
  const restored = useRef(false);
  const restorationRelease = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!user || !navigation) return;
    restored.current = false;
    const release = navigation.holdRestoration();
    let released = false;
    const finishRestoration = () => {
      if (released) return;
      released = true;
      if (restorationRelease.current === finishRestoration) restorationRelease.current = null;
      release();
    };
    restorationRelease.current = finishRestoration;
    const controller = new AbortController();
    const storageKey = `al-navigation-v1:${user.id}:ledger-dialogs`;
    let saved = null;
    try {
      saved = parseLedgerDialogSession(window.sessionStorage.getItem(storageKey));
    } catch {
      /* Storage can be unavailable; in-memory Back still works. */
    }
    const currentLayers = window.history.state?.[`al-navigation-v1:${user.id}`]?.layers as string[] | undefined;
    if (!saved || !currentLayers?.some((key) => key.startsWith("ledger:"))) {
      restored.current = true;
      finishRestoration();
      return () => {
        controller.abort();
        finishRestoration();
      };
    }
    void Promise.all(
      saved.entries.map(async (entry): Promise<LedgerDialog | null> => {
        if (entry.kind === "contacts") return { kind: entry.kind, key: entry.key };
        if (entry.kind === "contact" || entry.kind === "movement")
          return { kind: entry.kind, key: entry.key, id: entry.id! };
        // Reload never revives a destructive confirmation. Editors get fresh server defaults.
        if (entry.kind === "delete") return null;
        if (!entry.id) return { kind: "form", key: entry.key };
        try {
          return {
            kind: "form",
            key: entry.key,
            movement: await getPersonalLedgerMovement(entry.id, controller.signal),
          };
        } catch {
          return null;
        }
      }),
    ).then((entries) => {
      if (controller.signal.aborted) return;
      const valid = entries.filter((entry): entry is LedgerDialog => entry !== null);
      const currentKey = currentLayers.at(-1);
      const position = valid.findIndex((entry) => entry.key === currentKey);
      dispatch({
        type: "hydrate",
        state: { entries: valid, position: position < 0 ? Math.min(saved.position, valid.length - 1) : position },
      });
      restored.current = true;
    });
    return () => {
      controller.abort();
      finishRestoration();
    };
  }, [user, navigation]);
  useEffect(() => {
    if (!user || !navigation || !restored.current) return;
    // Child Modal effects register the restored layers before this parent effect.
    restorationRelease.current?.();
    try {
      window.sessionStorage.setItem(
        `al-navigation-v1:${user.id}:ledger-dialogs`,
        JSON.stringify(ledgerDialogSession(flow)),
      );
    } catch {
      /* Keep the current tab's in-memory flow. */
    }
  }, [flow, user, navigation]);
  const push = useCallback(
    (entry: LedgerDialogInput) => dispatch({ type: "push", entry: { ...entry, key: `ledger:${crypto.randomUUID()}` } }),
    [],
  );
  return { flow, dispatch, push };
}
