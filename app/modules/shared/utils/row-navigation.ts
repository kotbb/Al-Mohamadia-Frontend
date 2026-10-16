import type { RowNavigationIntent } from "../types/row-navigation.types";

export function canNavigateRow(intent: RowNavigationIntent): boolean {
  return (
    !intent.disabled &&
    intent.button === 0 &&
    !intent.modified &&
    !intent.defaultPrevented &&
    !intent.interactiveTarget &&
    !intent.textSelected
  );
}
