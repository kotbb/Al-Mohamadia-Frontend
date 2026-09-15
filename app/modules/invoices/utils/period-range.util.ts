import type { SalesInvoicePeriod } from "@/app/modules/invoices/types/invoices.types";

export interface PeriodRangeInfo {
  fromIso: string;
  toIso: string;
  fromDmy: string;
  toDmy: string;
  displayRange: string;
  badgeLabel?: string;
}

export function parseIsoDate(isoDate: string): {
  year: number;
  month: number;
  day: number;
} {
  const parts = isoDate.split("-").map(Number);
  if (parts.length < 3 || parts.some(isNaN)) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }
  return { year: parts[0], month: parts[1], day: parts[2] };
}

export function formatDmy(year: number, month: number, day: number): string {
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  const yyyy = String(year);
  return `${dd} / ${mm} / ${yyyy}`;
}

export function formatIso(year: number, month: number, day: number): string {
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  const yyyy = String(year);
  return `${yyyy}-${mm}-${dd}`;
}

/** JS getUTCDay: 0=Sun … 6=Sat. Cairo week is Saturday–Friday. */
function daysSinceSaturday(utcDay: number): number {
  return (utcDay + 1) % 7;
}

export function getPeriodRangeInfo(
  period: SalesInvoicePeriod,
  isoDate: string,
  locale: string,
): PeriodRangeInfo {
  const { year, month, day } = parseIsoDate(isoDate);

  if (period === "day") {
    const dmy = formatDmy(year, month, day);
    return {
      fromIso: isoDate,
      toIso: isoDate,
      fromDmy: dmy,
      toDmy: dmy,
      displayRange: dmy,
    };
  }

  if (period === "week") {
    // Determine Saturday of the week containing isoDate
    const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const utcDay = probe.getUTCDay();
    const sinceSat = daysSinceSaturday(utcDay);

    const startUtc = new Date(Date.UTC(year, month - 1, day - sinceSat, 12, 0, 0));
    const endUtc = new Date(Date.UTC(year, month - 1, day - sinceSat + 6, 12, 0, 0));

    const sYear = startUtc.getUTCFullYear();
    const sMonth = startUtc.getUTCMonth() + 1;
    const sDay = startUtc.getUTCDate();

    const eYear = endUtc.getUTCFullYear();
    const eMonth = endUtc.getUTCMonth() + 1;
    const eDay = endUtc.getUTCDate();

    const fromDmy = formatDmy(sYear, sMonth, sDay);
    const toDmy = formatDmy(eYear, eMonth, eDay);

    return {
      fromIso: formatIso(sYear, sMonth, sDay),
      toIso: formatIso(eYear, eMonth, eDay),
      fromDmy,
      toDmy,
      displayRange: `${fromDmy} - ${toDmy}`,
      badgeLabel: locale === "ar" ? "السبت - الجمعة" : "Sat - Fri",
    };
  }

  if (period === "month") {
    const startUtc = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
    // Day 0 of next month is the last day of this month
    const endUtc = new Date(Date.UTC(year, month, 0, 12, 0, 0));

    const sYear = startUtc.getUTCFullYear();
    const sMonth = startUtc.getUTCMonth() + 1;
    const sDay = startUtc.getUTCDate();

    const eYear = endUtc.getUTCFullYear();
    const eMonth = endUtc.getUTCMonth() + 1;
    const eDay = endUtc.getUTCDate();

    const fromDmy = formatDmy(sYear, sMonth, sDay);
    const toDmy = formatDmy(eYear, eMonth, eDay);

    const monthName = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      month: "long",
      year: "numeric",
    }).format(startUtc);

    return {
      fromIso: formatIso(sYear, sMonth, sDay),
      toIso: formatIso(eYear, eMonth, eDay),
      fromDmy,
      toDmy,
      displayRange: `${fromDmy} - ${toDmy}`,
      badgeLabel: monthName,
    };
  }

  // period === "year"
  const fromDmy = formatDmy(year, 1, 1);
  const toDmy = formatDmy(year, 12, 31);
  return {
    fromIso: formatIso(year, 1, 1),
    toIso: formatIso(year, 12, 31),
    fromDmy,
    toDmy,
    displayRange: `${fromDmy} - ${toDmy}`,
    badgeLabel: `${year}`,
  };
}

/**
 * Shifts the date by delta units based on the period.
 * delta: -1 (previous) or +1 (next)
 */
export function shiftPeriodDate(
  period: SalesInvoicePeriod,
  isoDate: string,
  delta: number,
): string {
  const { year, month, day } = parseIsoDate(isoDate);

  if (period === "day") {
    const utc = new Date(Date.UTC(year, month - 1, day + delta, 12, 0, 0));
    return formatIso(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
  }

  if (period === "week") {
    const utc = new Date(Date.UTC(year, month - 1, day + delta * 7, 12, 0, 0));
    return formatIso(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
  }

  if (period === "month") {
    const utc = new Date(Date.UTC(year, month - 1 + delta, day, 12, 0, 0));
    return formatIso(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
  }

  // year
  return formatIso(year + delta, month, day);
}
