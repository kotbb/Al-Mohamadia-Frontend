"use client";
import { useContext } from "react";
import { useRouter } from "@/i18n/navigation";
import { NavigationContext } from "../components/navigation-context";
import type { AppNavigation } from "../types/navigation.types";

export function useAppNavigation(): AppNavigation {
  const navigation = useContext(NavigationContext);
  const router = useRouter();
  return (
    navigation ?? {
      push: router.push,
      replace: router.replace,
      complete: router.replace,
      back: (fallback = "/") => router.replace(fallback),
      request: (action) => action(),
      dismiss: (action) => action(),
      retireLayers: () => undefined,
      holdRestoration: () => () => undefined,
      registerGuard: () => () => undefined,
      openLayer: () => () => undefined,
    }
  );
}
