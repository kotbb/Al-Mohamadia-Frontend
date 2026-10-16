"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { userFacingErrorMessage } from "./error-message";

export function useApiErrorMessage() {
  const t = useTranslations("shared");
  const rateLimitMessage = t("rateLimit");

  return useCallback(
    (error: unknown, fallback: string) =>
      userFacingErrorMessage(error, rateLimitMessage, fallback),
    [rateLimitMessage],
  );
}
