"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/app/modules/auth/components/login-form";
import { HeaderControls } from "@/app/layout/header-controls";
import { useAuth } from "@/lib/auth/auth-provider";
import { useRouter } from "@/i18n/navigation";
import { LoadingState } from "@/app/modules/shared/components/loading-state";

export function LoginPage() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const tShared = useTranslations("shared");
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState message={tShared("loading")} />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <section
        aria-label={tApp("name")}
        className="login-brand-enter login-timber-grain relative flex min-h-[34vh] items-center overflow-hidden bg-ink px-8 py-10 text-white sm:px-10 lg:min-h-screen lg:px-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -start-16 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-10 bottom-0 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
        />

        <div className="relative max-w-lg">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {tApp("name")}
          </h1>

          <div
            aria-hidden
            className="mt-5 h-1 w-20 rounded-full sm:w-28"
            style={{
              background:
                "linear-gradient(to inline-end, var(--accent) 0%, color-mix(in srgb, var(--accent) 35%, transparent) 100%)",
            }}
          />

          <p className="mt-5 text-base font-medium tracking-wide text-accent sm:text-lg">
            {tApp("tagline")}
          </p>
        </div>
      </section>

      <section className="relative flex min-h-[66vh] flex-col bg-gradient-to-b from-background via-surface-muted/40 to-background lg:min-h-screen">
        <header className="flex justify-end px-5 py-4 sm:px-8">
          <HeaderControls showAuthActions={false} />
        </header>

        <div className="login-form-enter flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary">
                {t("title")}
              </h2>
              <p className="mt-2 text-base text-text-muted">{t("subtitle")}</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-surface/90 p-6 shadow-[0_18px_40px_-28px_color-mix(in_srgb,var(--ink)_45%,transparent)] backdrop-blur-sm sm:p-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
