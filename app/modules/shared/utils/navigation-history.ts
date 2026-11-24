import type { HistoryEntry } from "../types/navigation.types";

export function safeReturnPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u0020]/.test(decoded)) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

export function departingGuardKeys(
  current: string[],
  target: string[],
  keys: string[],
  routeChange: boolean,
): string[] {
  return routeChange ? keys : keys.filter((key) => current.includes(key) && !target.includes(key));
}

export function nextHistoryEntry(current: HistoryEntry, url: string, id: string, replace: boolean): HistoryEntry {
  return replace
    ? { ...current, url, layers: [] }
    : { id, position: current.position + 1, url, layers: [], source: current.url, sourceEntryId: current.id };
}
