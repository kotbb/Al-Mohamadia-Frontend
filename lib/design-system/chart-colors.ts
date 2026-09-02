/**
 * Chart color rules — see docs/Design-System.md §10 (Charts).
 * Ordinary metrics: primary + neutral scale. Semantic colors only for semantic data.
 */

export const CHART_NEUTRAL_SERIES = [
  "var(--primary)",
  "var(--border)",
  "var(--surface-muted)",
  "var(--text-muted)",
] as const;

export const CHART_SEMANTIC = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
} as const;
