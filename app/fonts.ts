import { Noto_Sans, Noto_Sans_Arabic } from "next/font/google";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const appFontsClassName = `${notoSansArabic.variable} ${notoSans.variable} font-sans`;
