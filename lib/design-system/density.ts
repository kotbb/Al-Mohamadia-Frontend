/** Quiet Ledger density tiers — see docs/Design-System.md §7 */

export type Density = "comfortable" | "compact";

export const DENSITY = {
  comfortable: {
    tableRowHeight: "52px",
    tableCellPaddingY: "12px",
    tableCellPaddingX: "16px",
    inputHeight: "44px",
    buttonHeight: "44px",
    buttonHeightTertiary: "40px",
    formFieldGap: "20px",
    sectionGapMin: "32px",
    sectionGapMax: "48px",
  },
  compact: {
    tableRowHeight: "40px",
    tableCellPaddingY: "8px",
    tableCellPaddingX: "12px",
    inputHeight: "40px",
    buttonHeight: "40px",
    buttonHeightTertiary: "36px",
    formFieldGap: "16px",
    sectionGapMin: "24px",
    sectionGapMax: "32px",
  },
} as const;

/** Tables that may offer a per-user Compact density toggle (desktop only). */
export const COMPACT_ELIGIBLE_TABLES = [
  "invoices",
  "inventory",
  "audit",
] as const;

/** Workflows that must always use Comfortable density. */
export const COMFORTABLE_REQUIRED = [
  "new-invoice",
  "payment-entry",
] as const;
