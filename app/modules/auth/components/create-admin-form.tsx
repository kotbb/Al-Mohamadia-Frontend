"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/app/modules/shared/components/input";
import { Button } from "@/app/modules/shared/components/button";

interface CreateAdminFormProps {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => Promise<void>;
}

export function CreateAdminForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  isSubmitting,
  error,
  onSubmit,
}: CreateAdminFormProps) {
  const t = useTranslations("users");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{t("createTitle")}</h2>
        <p className="mt-1 text-sm text-text-muted">{t("createSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="createUsername"
          label={t("username")}
          autoComplete="off"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          required
          disabled={isSubmitting}
        />
        <Input
          name="createPassword"
          type="password"
          label={t("password")}
          autoComplete="new-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required
          minLength={8}
          hint={t("passwordHint")}
          disabled={isSubmitting}
        />
      </div>

      {error ? (
        <p
          className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          variant="accent"
          disabled={isSubmitting || !username.trim() || password.length < 8}
        >
          {isSubmitting ? t("creating") : t("createSubmit")}
        </Button>
      </div>
    </form>
  );
}
