"use client";

import type { UseLoginResult } from "../types/use-login.types";
import {
  readStoredRetryAt,
  storeRetryAt,
  clearStoredRetryAt,
} from "../utils/login-retry-storage";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/lib/auth/auth-provider";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

const RATE_LIMIT_MS = 60_000;

export function useLogin(): UseLoginResult {
  const describeError = useApiErrorMessage();
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const retryAtRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const stored = readStoredRetryAt();
    if (stored === null) return;
    retryAtRef.current = stored;
    setRetryAt(stored);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (retryAt === null) return;

    const tick = () => {
      if (Date.now() >= retryAt) {
        retryAtRef.current = null;
        clearStoredRetryAt();
        setRetryAt(null);
        return;
      }
      setNow(Date.now());
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  const submit = useCallback(async () => {
    if (retryAtRef.current !== null && Date.now() < retryAtRef.current) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(username.trim(), password);
      router.replace("/");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.statusCode === 429) {
        const until = Date.now() + RATE_LIMIT_MS;
        retryAtRef.current = until;
        storeRetryAt(until);
        setRetryAt(until);
        setNow(Date.now());
      }
      setErrorMessage(describeError(error, "Login failed"));
    } finally {
      setIsSubmitting(false);
    }
  }, [login, username, password, router, describeError]);

  const rateLimitSecondsLeft =
    retryAt === null ? 0 : Math.max(0, Math.ceil((retryAt - now) / 1000));

  return {
    username,
    password,
    setUsername,
    setPassword,
    isSubmitting,
    rateLimitSecondsLeft,
    errorMessage,
    submit,
  };
}
