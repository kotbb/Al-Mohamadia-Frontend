"use client";
import { useContext, useEffect, useId } from "react";
import { NavigationContext } from "../components/navigation-context";
import type { LeaveGuard } from "../types/navigation.types";

export function useLeaveGuard({ dirty, busy, layerKey, enabled = true }: LeaveGuard & { enabled?: boolean }) {
  const navigation = useContext(NavigationContext);
  const key = useId();
  useEffect(() => {
    if (!enabled) return;
    return navigation?.registerGuard(key, { dirty, busy, layerKey });
  }, [navigation, key, dirty, busy, layerKey, enabled]);
}
