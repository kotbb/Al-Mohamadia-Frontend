const OBJECT_ID = /^[a-f0-9]{24}$/i;
const HIDDEN_FIELD = /password|token|secret|hash|^code$/i;
const HIDDEN_KEY = /^(id|_id|password|passwordHash|token|pdfShareToken|accessToken|refreshToken|secret|code)$|Id$/;

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

/** Drops stored ids from a summary, and drops an item code when the name is also present. */
export function formatAuditSummary(summary: string): string {
  const created = summary.match(/^Item created:\s+.+?\s+—\s+(.+)$/);
  const text = created?.[1] ? `Item created: ${created[1]}` : summary;

  return text
    .replace(/new\s+ObjectId\(\s*['"][a-f0-9]{24}['"]\s*\)/gi, "")
    .replace(/\b[a-f0-9]{24}\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.:])/g, "$1")
    .trim();
}

/** Fields that must never be rendered, even when the stored value looks harmless. */
export function isHiddenAuditField(field: string): boolean {
  return HIDDEN_FIELD.test(field);
}

/**
 * Human-readable change text.
 * Returns null when the value is only an id, a secret, or an object dump.
 */
export function formatAuditChangeValue(
  field: string,
  value: unknown,
  locale: string,
  emptyLabel: string,
): string | null {
  if (isHiddenAuditField(field)) return null;
  return presentValue(field, value, locale, emptyLabel);
}

function presentValue(
  field: string,
  value: unknown,
  locale: string,
  emptyLabel: string,
): string | null {
  if (value === null || value === undefined) return emptyLabel;

  if (field === "reversedAt" && typeof value === "string" && !isObjectId(value)) {
    return formatAuditTimestamp(value, locale);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => presentValue(field, entry, locale, emptyLabel))
      .filter((entry): entry is string => entry !== null && entry !== emptyLabel);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "string") {
    return presentString(value, emptyLabel);
  }

  if (typeof value === "object") {
    return presentObject(value, locale, emptyLabel);
  }

  return null;
}

function presentString(value: string, emptyLabel: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return emptyLabel;
  if (isObjectId(trimmed)) return null;

  const named = readEmbeddedName(trimmed);
  if (named) return named;

  const withoutIds = trimmed
    .replace(/new\s+ObjectId\(\s*['"][a-f0-9]{24}['"]\s*\)/gi, "")
    .replace(/\b[a-f0-9]{24}\b/gi, "")
    .replace(/[{},]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!withoutIds || withoutIds === trimmed && looksLikeDump(trimmed)) return null;
  if (withoutIds !== trimmed) {
    return withoutIds.length > 0 ? withoutIds : null;
  }

  return trimmed;
}

function presentObject(
  value: object,
  locale: string,
  emptyLabel: string,
): string | null {
  if ("name" in value && typeof value.name === "string" && value.name.trim()) {
    return value.name.trim();
  }

  const parts = Object.entries(value)
    .filter(([key]) => !HIDDEN_KEY.test(key))
    .map(([, entry]) => presentValue("", entry, locale, emptyLabel))
    .filter((entry): entry is string => entry !== null && entry !== emptyLabel);

  return parts.length > 0 ? parts.join(", ") : null;
}

function readEmbeddedName(value: string): string | null {
  const inspected = value.match(/name:\s*'([^']*)'|name:\s*"([^"]*)"/);
  const inspectedName = inspected?.[1] ?? inspected?.[2];
  if (inspectedName?.trim()) return inspectedName.trim();

  if (value.startsWith("{") && value.endsWith("}")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === "object" && "name" in parsed) {
        const name = parsed.name;
        if (typeof name === "string" && name.trim()) return name.trim();
      }
    } catch {
      return null;
    }
  }

  return null;
}

function isObjectId(value: string): boolean {
  return OBJECT_ID.test(value);
}

function looksLikeDump(value: string): boolean {
  return value.includes("_id") || value.includes("ObjectId");
}
