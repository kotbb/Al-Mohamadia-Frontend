"use client";

import type { ReactNode } from "react";
import { NavigationProvider } from "@/app/modules/shared/components/navigation-provider";
import { Suspense } from "react";
import { AuthGuard } from "@/lib/auth/auth-guard";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Suspense>
        <NavigationProvider>{children}</NavigationProvider>
      </Suspense>
    </AuthGuard>
  );
}
