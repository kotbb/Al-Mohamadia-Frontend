"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { useRouter } from "@/i18n/navigation";

interface UseLoginResult {
  username: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  submit: () => Promise<void>;
}

export function useLogin(): UseLoginResult {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(username.trim(), password);
      router.replace("/");
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Login failed";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [login, username, password, router]);

  return {
    username,
    password,
    setUsername,
    setPassword,
    isSubmitting,
    errorMessage,
    submit,
  };
}
