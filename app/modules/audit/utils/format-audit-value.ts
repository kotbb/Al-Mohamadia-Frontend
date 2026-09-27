/** Cairo date and time, same layout as invoice dates. */
export function formatAuditTimestamp(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const resolvedLocale = locale === "ar" ? "ar-EG-u-nu-latn" : locale;
  return new Intl.DateTimeFormat(resolvedLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
  }).format(date);
}

export function formatAuditChangeValue(
  field: string,
  value: unknown,
  locale: string,
  emptyLabel: string,
): string {
  if (value === null || value === undefined) return emptyLabel;

  if (field === "reversedAt" && typeof value === "string") {
    return formatAuditTimestamp(value, locale);
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        entry === null || entry === undefined ? emptyLabel : String(entry),
      )
      .join(", ");
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return JSON.stringify(value);
}
