"use client";

import { GlobalErrorPage } from "./modules/shared/components/global-error-page";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <GlobalErrorPage reset={reset} />;
}
