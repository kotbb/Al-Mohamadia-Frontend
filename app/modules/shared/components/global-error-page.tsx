"use client";

import { FallbackPage } from "./fallback-page";
import { appFontsClassName } from "@/app/fonts";

export function GlobalErrorPage({ reset }: { reset: () => void }) {
  return <html lang="en" dir="ltr" className={appFontsClassName}><body>
    <FallbackPage code="!" title="Something went wrong" description="The page could not be loaded. Try again or return to the app." homeHref="/en" homeLabel="Back to the app" retryLabel="Try again" onRetry={reset} />
  </body></html>;
}
