"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { LoginBrandPanel } from "@/app/modules/auth/components/login-brand-panel";
import { LoginDecorativeCircles } from "@/app/modules/auth/components/login-decorative-circles";
import { LoginForm } from "@/app/modules/auth/components/login-form";
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
      <div className="flex min-h-screen items-center justify-center bg-background p-5">
        <LoadingState message={tShared("loading")} />
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      className="login-form-enter grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]"
    >
      <div className="order-1 border-border lg:border-e">
        <LoginBrandPanel />
      </div>

      <section className="relative order-2 flex min-h-screen flex-col overflow-hidden">
        <LoginDecorativeCircles />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-16 pt-8 sm:px-12 sm:pb-20 sm:pt-10 lg:px-16 lg:py-14 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
              <div className="mb-8 flex items-center justify-center gap-3 sm:mb-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/icon-mark.png"
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-border"
                />
                <span className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                  {tApp("name")}
                </span>
              </div>

              <h1 className="text-2xl font-medium tracking-tight text-text-secondary sm:text-3xl">
                {t("title")}
              </h1>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-text-muted sm:text-base">
                {t("subtitle")}
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </section>
    </div>
  );
}
