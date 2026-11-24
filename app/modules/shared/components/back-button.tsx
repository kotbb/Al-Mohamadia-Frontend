"use client";
import { useTranslations } from "next-intl";
import { useAppNavigation } from "../hooks/use-app-navigation";
import { Button } from "./button";

export function BackButton({ fallback = "/", disabled = false }: { fallback?: string; disabled?: boolean }) {
  const navigation = useAppNavigation();
  const t = useTranslations("navigation");
  return (
    <Button
      variant="secondary"
      className="min-w-11 shrink-0 !px-2"
      aria-label={t("back")}
      title={t("back")}
      disabled={disabled}
      onClick={() => navigation.back(fallback)}
    >
      <svg
        className="size-5 rtl:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Button>
  );
}
