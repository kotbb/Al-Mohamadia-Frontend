"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useLogin } from "@/app/modules/auth/hooks/use-login";
import { Input } from "@/app/modules/shared/components/input";
import { Button } from "@/app/modules/shared/components/button";

export function LoginForm() {
  const t = useTranslations("auth");
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
        className="bg-surface-muted/50"
      />
      <Input
        name="password"
        type="password"
        label={t("password")}
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        disabled={isSubmitting}
        className="bg-surface-muted/50"
      />

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
        className="mt-1 w-full"
        disabled={isSubmitting || !username || !password}
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
