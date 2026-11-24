import type {
  ExportCatalog,
  ExportDataset,
  ExportPeriod,
  ExportRequest,
  ExportSeed,
  ExportSelection,
} from "../types/exports.types";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";

export function defaultExportSelection(dataset: ExportDataset): ExportSelection {
  return {
    dataset: dataset.id,
    columns: dataset.columns.filter((c) => c.default).map((c) => c.id),
    filters: dataset.transactional ? { status: dataset.lineColumns ? "saved" : "active" } : {},
  };
}
export function initialExportRequest(catalog: ExportCatalog, seed: ExportSeed): ExportRequest {
  const seeded = catalog.datasets.find((d) => d.id === seed.get("dataset"));
  const dataset = seeded ?? catalog.datasets[0];
  const selection = defaultExportSelection(dataset);
  let period: ExportPeriod = { kind: "month", date: todayIsoDate() };
  if (seeded) {
    period = { kind: "all" };
    if (seed.get("period") === "custom")
      period = { kind: "custom", from: seed.get("from") ?? "", to: seed.get("to") ?? "" };
    else if (seed.get("from") && seed.get("to"))
      period = { kind: "custom", from: seed.get("from")!, to: seed.get("to")! };
    else if (["day", "week", "month", "year"].includes(seed.get("period") ?? ""))
      period = { kind: seed.get("period") as ExportPeriod["kind"], date: seed.get("date") ?? todayIsoDate() };
    for (const [key, choices] of Object.entries(dataset.filters)) {
      const value = seed.get(key);
      if (value === null || value === "") continue;
      if (choices[0] === "boolean") {
        if (value === "true" || value === "false") selection.filters[key] = value === "true";
      } else if (choices[0] === "text" || choices[0] === "id" || choices.includes(value))
        selection.filters[key] = value;
    }
  }
  return { locale: "ar", period, selections: [selection] };
}
export function exportRequestValid(request: ExportRequest): boolean {
  if (
    !request.selections.length ||
    request.selections.some((s) => !s.columns.length || (s.includeLines && !s.lineColumns?.length))
  )
    return false;
  const p = request.period;
  const validDate = (value?: string) =>
    !!value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  return (
    p.kind === "all" ||
    (p.kind === "custom" ? validDate(p.from) && validDate(p.to) && p.from! <= p.to! : validDate(p.date))
  );
}
