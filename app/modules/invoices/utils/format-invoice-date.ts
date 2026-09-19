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

/** Cairo calendar YYYY-MM-DD for period filters (matches backend Africa/Cairo). */
export function todayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
