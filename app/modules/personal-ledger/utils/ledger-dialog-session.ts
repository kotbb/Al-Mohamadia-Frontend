import type { LedgerDialogFlow, LedgerDialogSession } from "../types/ledger-dialog-flow.types";

/** Descriptors only: never serialize movement payloads or unfinished form inputs. */
export function ledgerDialogSession(flow: LedgerDialogFlow): LedgerDialogSession {
  return {
    position: flow.position,
    entries: flow.entries.map((entry) => ({
      key: entry.key,
      kind: entry.kind,
      ...("id" in entry ? { id: entry.id } : "movement" in entry && entry.movement ? { id: entry.movement.id } : {}),
    })),
  };
}

export function parseLedgerDialogSession(raw: string | null): LedgerDialogSession | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("entries" in parsed) ||
      !Array.isArray(parsed.entries) ||
      !("position" in parsed) ||
      !Number.isInteger(parsed.position)
    )
      return null;
    if (parsed.entries.length > 50 || Number(parsed.position) < -1 || Number(parsed.position) >= parsed.entries.length)
      return null;
    const entries: LedgerDialogSession["entries"] = [];
    for (const entry of parsed.entries) {
      if (
        !entry ||
        typeof entry !== "object" ||
        typeof entry.key !== "string" ||
        !["contacts", "contact", "movement", "form", "delete"].includes(entry.kind)
      )
        return null;
      if (
        (entry.kind === "contact" || entry.kind === "movement" || entry.kind === "delete") &&
        typeof entry.id !== "string"
      )
        return null;
      if (entry.id !== undefined && typeof entry.id !== "string") return null;
      entries.push({ key: entry.key, kind: entry.kind, ...(entry.id ? { id: entry.id } : {}) });
    }
    return { entries, position: Number(parsed.position) };
  } catch {
    return null;
  }
}
