import { FallbackPage } from "./fallback-page";
import { appFontsClassName } from "@/app/fonts";

export function GlobalNotFoundPage() {
  return <html lang="en" dir="ltr" className={appFontsClassName}><body>
    <FallbackPage code="404" title="Page not found" description="This address does not lead to a page. Check the URL or return to the app." homeHref="/ar" homeLabel="Back to the app" />
  </body></html>;
}
