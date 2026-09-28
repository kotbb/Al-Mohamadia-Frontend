"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef } from "react";
import { userFacingErrorMessage } from "./error-message";

export function useApiErrorMessage() {
  const t = useTranslations("shared");
  const rateLimitMessage = useRef(t("rateLimit"));
  rateLimitMessage.current = t("rateLimit");

  return useCallback(
    (error: unknown, fallback: string) =>
      userFacingErrorMessage(error, rateLimitMessage.current, fallback),
    [],
  );
}
