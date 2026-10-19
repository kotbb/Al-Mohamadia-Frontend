import type { AuditLog } from "@/app/modules/audit/types/audit.types";

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

type AuditSummaryKey =
  | "summaryActionOnly"
  | "summaryWithValue"
  | "summaryMerged"
  | "summaryPaymentForCustomer"
  | "summaryPaymentForSupplier"
  | "summaryPurchaseCreated"
  | "summaryPriceChanged"
  | "summaryDimensionDefaultsUpdated";

export interface AuditSummaryDescription {
  key: AuditSummaryKey;
  values: Record<string, string>;
}

const SIMPLE_SUMMARY_PREFIXES: Record<string, string> = {
  admin_created: "Admin created",
  admin_updated: "Admin updated",
  admin_deleted: "Admin deleted",
  customer_created: "Customer created",
  customer_edited: "Customer edited",
  customer_deleted: "Customer deleted",
  supplier_created: "Supplier created",
  supplier_edited: "Supplier edited",
  supplier_deleted: "Supplier deleted",
  invoice_created: "Invoice created",
  invoice_updated: "Invoice updated",
  invoice_cancelled: "Invoice cancelled",
  purchase_cancelled: "Purchase invoice cancelled",
  item_created: "Item created",
  item_edited: "Item edited",
  item_deleted: "Item deleted",
  stock_adjusted: "Stock adjusted",
  category_created: "Category created",
  category_edited: "Category edited",
  category_deleted: "Category deleted",
};

/** Describes known persisted English summaries without changing the audit record. */
export function describeAuditSummary(
  log: Pick<AuditLog, "action" | "summary">,
  actionLabel: string,
  fieldLabel: (field: string) => string,
): AuditSummaryDescription | null {
  if (!log.summary?.trim()) {
    return { key: "summaryActionOnly", values: { action: actionLabel } };
  }

  const summary = formatAuditSummary(log.summary);
  const simplePrefix = SIMPLE_SUMMARY_PREFIXES[log.action];
  if (simplePrefix && summary.startsWith(`${simplePrefix}: `)) {
    const value = summary.slice(simplePrefix.length + 2).trim();
    if (value) return { key: "summaryWithValue", values: { action: actionLabel, value } };
  }

  if (log.action === "customer_merged" || log.action === "supplier_merged") {
    const prefix = log.action === "customer_merged" ? "Customers merged" : "Suppliers merged";
    const match = summary.match(new RegExp(`^${prefix}: (.+) → (.+)$`));
    if (match) return { key: "summaryMerged", values: { action: actionLabel, sources: match[1], target: match[2] } };
  }

  if (["payment_recorded", "payment_cancelled", "supplier_payment_recorded", "supplier_payment_cancelled"].includes(log.action)) {
    const match = summary.match(/^Payment of (.+?) EGP (recorded|cancelled) for (customer|supplier): (.+)$/);
    const expectedParty = log.action.startsWith("supplier_") ? "supplier" : "customer";
    const expectedVerb = log.action.endsWith("_recorded") ? "recorded" : "cancelled";
    if (match && match[2] === expectedVerb && match[3] === expectedParty) {
      return {
        key: expectedParty === "supplier" ? "summaryPaymentForSupplier" : "summaryPaymentForCustomer",
        values: { action: actionLabel, amount: match[1], name: match[4] },
      };
    }
  }

  if (log.action === "purchase_created") {
    const match = summary.match(/^Purchase invoice created: (.+?) for supplier: (.+)$/);
    if (match) return { key: "summaryPurchaseCreated", values: { number: match[1], supplier: match[2] } };
  }

  if (log.action === "price_changed") {
    const match = summary.match(/^([A-Za-z][A-Za-z\d]*): (.+) → (.+)$/);
    if (match) return { key: "summaryPriceChanged", values: { field: fieldLabel(match[1]), old: match[2], new: match[3] } };
  }

  if (log.action === "item_edited" && summary.startsWith("Item dimension defaults updated: ")) {
    const name = summary.slice("Item dimension defaults updated: ".length).trim();
    if (name) return { key: "summaryDimensionDefaultsUpdated", values: { name } };
  }

  return null;
}

/** Fields that must never be rendered, even when the stored value looks harmless. */
export function isHiddenAuditField(field: string): boolean {
  return HIDDEN_FIELD.test(field);
}

export interface AuditValueLabels {
  value: (field: string, code: string) => string | null;
  dimension: (field: "thickness" | "width" | "length") => string;
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
  labels?: AuditValueLabels,
): string | null {
  if (isHiddenAuditField(field)) return null;
  return presentValue(field, value, locale, emptyLabel, labels);
}

function presentValue(
  field: string,
  value: unknown,
  locale: string,
  emptyLabel: string,
  labels?: AuditValueLabels,
): string | null {
  if (value === null || value === undefined) return emptyLabel;

  if (field === "reversedAt" && typeof value === "string" && !isObjectId(value)) {
    return formatAuditTimestamp(value, locale);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => presentValue(field, entry, locale, emptyLabel, labels))
      .filter((entry): entry is string => entry !== null && entry !== emptyLabel);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  if (typeof value === "boolean") {
    return labels?.value(field, String(value)) ?? String(value);
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return labels?.value(field, value.trim()) ?? presentString(value, emptyLabel);
  }

  if (typeof value === "object") {
    if (field === "dimensionDefaults" && !Array.isArray(value)) {
      const dimensions = (["thickness", "width", "length"] as const).flatMap((key) => {
        const entries = (value as Record<string, unknown>)[key];
        if (!Array.isArray(entries) || entries.length === 0) return [];
        return [`${labels?.dimension(key) ?? key}: ${entries.join(", ")}`];
      });
      return dimensions.length > 0 ? dimensions.join(locale === "ar" ? "؛ " : "; ") : emptyLabel;
    }
    return presentObject(value, locale, emptyLabel, labels);
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
  labels?: AuditValueLabels,
): string | null {
  if ("name" in value && typeof value.name === "string" && value.name.trim()) {
    return value.name.trim();
  }

  const parts = Object.entries(value)
    .filter(([key]) => !HIDDEN_KEY.test(key))
    .map(([, entry]) => presentValue("", entry, locale, emptyLabel, labels))
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
