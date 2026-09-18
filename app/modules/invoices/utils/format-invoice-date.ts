/** Formats an ISO date/datetime for display in the given locale (Day Month Year, Hour:Minute). */
export function formatInvoiceDate(
  value: string | undefined,
  locale: string,
  options?: { dateOnly?: boolean },
): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const resolvedLocale = locale === "ar" ? "ar-EG-u-nu-latn" : locale;
  if (options?.dateOnly) {
    return new Intl.DateTimeFormat(resolvedLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat(resolvedLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Cairo-oriented YYYY-MM-DD for period filter (local calendar day). */
export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
