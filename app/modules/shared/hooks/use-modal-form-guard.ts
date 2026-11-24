"use client";

import { useState } from "react";
import { formSnapshot } from "../utils/form-snapshot";
import { useLeaveGuard } from "./use-leave-guard";
import { useAppNavigation } from "./use-app-navigation";

/** Capture open-time defaults; keep sensitive form values only in component memory. */
export function useModalFormGuard(open: boolean, values: unknown, busy: boolean) {
  const snapshot = formSnapshot(values);
  const [baseline, setBaseline] = useState({ open, snapshot });
  if (baseline.open !== open) setBaseline({ open, snapshot });
  const dirty = open && baseline.open && snapshot !== baseline.snapshot;
  useLeaveGuard({ dirty, busy, enabled: open });
  const navigation = useAppNavigation();
  return {
    dirty,
    requestClose: (action: () => void) => navigation.dismiss(action),
  };
}
