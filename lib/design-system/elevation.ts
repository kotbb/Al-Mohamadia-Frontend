/** Elevation levels — see docs/Design-System.md §8 */

export const ELEVATION = {
  /** Cards, tables, forms — border only, no shadow */
  0: "",
  /** Dropdowns, popovers, toasts */
  1: "ds-elevation-1",
  /** Modals, critical overlays */
  2: "ds-elevation-2",
} as const;

export const SCRIM_CLASS = "ds-scrim";
