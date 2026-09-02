"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useLogin } from "@/app/modules/auth/hooks/use-login";
import { Input } from "@/app/modules/shared/components/input";
import { Button } from "@/app/modules/shared/components/button";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1 1 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

export function LoginForm() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const {
    username,
    password,
    setUsername,
    setPassword,
    isSubmitting,
    errorMessage,
    submit,
  } = useLogin();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <Input
        name="username"
        label={t("username")}
        autoComplete="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
        disabled={isSubmitting}
      />

      <div className="flex w-full flex-col gap-1.5">
        <span className="text-base font-medium text-text-secondary">
          {t("password")}
        </span>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={isSubmitting}
            placeholder={t("passwordPlaceholder")}
            className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-4 pe-12 text-base text-text-primary placeholder:text-text-muted disabled:bg-surface-muted disabled:text-text-muted"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="ds-focus-ring absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition-colors hover:text-text-secondary"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            disabled={isSubmitting}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </div>

      {errorMessage ? (
        <p
          className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        className="mt-2 w-full shadow-[0_8px_24px_rgba(122,74,34,0.28)]"
        disabled={isSubmitting || !username || !password}
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="pt-1 text-center text-sm text-text-muted">
        <button
          type="button"
          className="ds-focus-ring rounded font-medium text-primary transition-colors hover:text-primary-hover"
          disabled={isSubmitting}
        >
          {t("forgotPassword")}
        </button>
      </p>
    </form>
  );
}
