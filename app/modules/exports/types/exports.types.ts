export type ExportLocale = "ar" | "en";
export interface ExportLabel {
  ar: string;
  en: string;
}
export interface ExportColumn {
  id: string;
  label: ExportLabel;
  type: string;
  default: boolean;
}
export interface ExportDataset {
  id: string;
  label: ExportLabel;
  transactional: boolean;
  columns: ExportColumn[];
  lineColumns?: ExportColumn[];
  filters: Record<string, string[]>;
}
export interface ExportCatalog {
  datasets: ExportDataset[];
  limits: { rows: number; bytes: number; preparationMs: number };
}
export interface ExportPeriod {
  kind: "all" | "day" | "week" | "month" | "year" | "custom";
  date?: string;
  from?: string;
  to?: string;
}
export interface ExportSelection {
  dataset: string;
  columns: string[];
  filters: Record<string, string | boolean>;
  includeLines?: boolean;
  lineColumns?: string[];
}
export interface ExportRequest {
  locale: ExportLocale;
  period: ExportPeriod;
  selections: ExportSelection[];
}
export interface ExportPreview {
  sheets: { dataset: string; lines: boolean; count: number; capped: boolean }[];
  total: number;
  overLimit: boolean;
  calculatedAt: string;
}
export interface ExportLookupOption {
  id: string;
  name: string;
  isActive?: boolean;
  isDeleted?: boolean;
}
export interface ExportSeed {
  get(key: string): string | null;
}
