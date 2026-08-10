"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/lib/auth/auth-guard";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
