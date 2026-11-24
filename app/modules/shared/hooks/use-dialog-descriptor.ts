"use client";
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { getStoredUser } from "@/lib/auth/auth-storage";

/** Store descriptor-only dialog context; editable business values never use this hook. */
export function useDialogDescriptor<T>(name: string) {
  const [value, setValue] = useState<T | null>(null);
  const [ready, setReady] = useState(false);
  const last = useRef<T | null>(null);
  const storageKey = useRef("");
  useEffect(() => {
    storageKey.current = `al-ui-v1:${getStoredUser()?.id ?? "anonymous"}:${location.pathname}:${name}`;
    try {
      const saved = sessionStorage.getItem(storageKey.current);
      if (saved) setValue(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, [name]);
  useEffect(() => {
    if (!ready) return;
    if (value !== null) last.current = value;
    try {
      sessionStorage.setItem(storageKey.current, JSON.stringify(value));
    } catch {}
  }, [value, ready]);
  const restore = useCallback(() => {
    setValue(last.current);
  }, []);
  return [value, setValue as Dispatch<SetStateAction<T | null>>, restore] as const;
}
