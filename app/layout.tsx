import type { ReactNode } from "react";

/**
 * Passthrough root so `[locale]/layout` owns `<html>` / `<body>`
 * for per-locale `lang` and `dir`.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
