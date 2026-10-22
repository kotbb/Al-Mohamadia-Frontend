import localFont from "next/font/local";

const notoSansArabic = localFont({
  src: "./font-files/noto-sans-arabic.woff2",
  variable: "--font-noto-sans-arabic",
  weight: "400 700",
  style: "normal",
  display: "swap",
});

const notoSans = localFont({
  src: "./font-files/noto-sans.woff2",
  variable: "--font-noto-sans",
  weight: "400 700",
  style: "normal",
  display: "swap",
});

export const appFontsClassName = `${notoSansArabic.variable} ${notoSans.variable} font-sans`;
