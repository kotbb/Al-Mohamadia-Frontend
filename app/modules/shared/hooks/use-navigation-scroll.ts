"use client";
import { useContext, useEffect, useRef } from "react";
import { NavigationContext } from "../components/navigation-context";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";

export function useNavigationScroll() {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  const ref = useRef<HTMLDivElement>(null);
  const navigation = useContext(NavigationContext);
  const { user } = useAuth();
  useEffect(() => {
    const element = ref.current;
    if (!element || !user) return;
    const key = `al-scroll-v1:${user.id}:${location.pathname}${location.search}`;
    let saved = 0;
    try {
      saved = Number(sessionStorage.getItem(key)) || 0;
    } catch {}
    let touched = false;
    const restore = () => {
      if (!touched && element.scrollHeight - element.clientHeight >= saved) element.scrollTop = saved;
    };
    const observer = new ResizeObserver(restore);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    const mutations = new MutationObserver(restore);
    mutations.observe(element, { childList: true, subtree: true });
    const touch = () => {
      touched = true;
    };
    element.addEventListener("pointerdown", touch, { passive: true });
    element.addEventListener("keydown", touch);
    element.addEventListener("wheel", touch, { passive: true });
    element.addEventListener("touchstart", touch, { passive: true });
    const save = () => {
      try {
        sessionStorage.setItem(key, String(element.scrollTop));
      } catch {}
    };
    window.addEventListener("app-navigation-leave", save);
    window.addEventListener("pagehide", save);
    restore();
    return () => {
      save();
      observer.disconnect();
      mutations.disconnect();
      element.removeEventListener("pointerdown", touch);
      element.removeEventListener("keydown", touch);
      element.removeEventListener("wheel", touch);
      element.removeEventListener("touchstart", touch);
      window.removeEventListener("app-navigation-leave", save);
      window.removeEventListener("pagehide", save);
    };
  }, [navigation, user, pathname, query]);
  return ref;
}
