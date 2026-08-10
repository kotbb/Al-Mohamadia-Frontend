"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import type { UserRole } from "./types";
import { useRouter } from "@/i18n/navigation";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { AccessDenied } from "@/app/modules/auth/components/access-denied";
import { useTranslations } from "next-intl";

interface AuthGuardProps {
  children: ReactNode;
  roles?: UserRole[];
}

export function AuthGuard({ children, roles }: AuthGuardProps) {
  const { status, user } = useAuth();
  const router = useRouter();
  const t = useTranslations("shared");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState message={t("loading")} />
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState message={t("loading")} />
      </div>
    );
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
