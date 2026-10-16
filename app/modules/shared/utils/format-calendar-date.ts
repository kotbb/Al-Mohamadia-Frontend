/** Format a date-only value without shifting its calendar day across timezones. */
export function formatCalendarDate(
  value: string | undefined,
  locale: string,
): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "—";
  const date = new Date(`${value}T12:00:00Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
