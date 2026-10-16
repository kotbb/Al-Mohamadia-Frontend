import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  experimental: { globalNotFound: true },
};

export default withNextIntl(nextConfig);
