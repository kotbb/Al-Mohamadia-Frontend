import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleLocale = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const firstSegment = request.nextUrl.pathname.split("/")[1];
  if (firstSegment && !routing.locales.some((locale) => locale === firstSegment)) {
    return NextResponse.rewrite(new URL("/en/__not-found", request.url));
  }
  return handleLocale(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
