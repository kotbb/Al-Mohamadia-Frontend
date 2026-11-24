const enumValues: Record<string, readonly string[]> = {
  period: ["all", "off", "day", "week", "month", "year", "custom"],
  status: ["all", "saved", "cancelled", "active", "reversed"],
  method: ["all", "cash", "instapay", "vodafone_cash", "bank_transfer", "check"],
  stockStatus: ["all", "normal", "low_stock", "out_of_stock"],
  isActive: ["all", "active", "inactive"],
};

function parameterKey(key: string): string {
  return key === "search" ? "q" : key;
}

export function readUrlState<T>(params: URLSearchParams, key: string, fallback: T, allowed?: readonly string[]): T {
  if (fallback !== null && typeof fallback === "object") {
    return Object.fromEntries(
      Object.entries(fallback).map(([field, value]) => [field, readUrlState(params, field, value)]),
    ) as T;
  }
  const raw = params.get(parameterKey(key));
  if (raw === null) return fallback;
  if (typeof fallback === "number") {
    const value = Number(raw);
    return (Number.isSafeInteger(value) && value > 0 ? value : fallback) as T;
  }
  if (key === "hasDebt") return (raw === "1" || raw === "true" ? "hasDebt" : "all") as T;
  const value = key === "isActive" ? (raw === "true" ? "active" : raw === "false" ? "inactive" : raw) : raw;
  const choices = allowed ?? enumValues[key];
  if (choices && !choices.includes(value)) return fallback;
  if (
    /^(?:audit)?(date|from|to)$/i.test(key) &&
    value &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value)
  )
    return fallback;
  return value as T;
}

export function writeUrlState<T>(params: URLSearchParams, key: string, value: T, fallback: T): void {
  if (value !== null && typeof value === "object") {
    for (const [field, next] of Object.entries(value))
      writeUrlState(params, field, next, (fallback as Record<string, unknown>)[field]);
    return;
  }
  const name = parameterKey(key);
  if (value === fallback || value === "" || value === null || value === undefined) {
    params.delete(name);
    return;
  }
  const serialized =
    key === "hasDebt"
      ? value === "hasDebt"
        ? "1"
        : "0"
      : key === "isActive"
        ? value === "active"
          ? "true"
          : "false"
        : String(value);
  params.set(name, serialized);
}
