import type {
  DimensionField,
  DimensionLineIdentity,
} from "../types/dimension-lines.types";

export function applySavedDimension<T extends DimensionLineIdentity>(
  lines: T[],
  key: string,
  itemId: string,
  field: DimensionField,
  value: number,
  isCurrent: boolean,
): T[] {
  if (!isCurrent) return lines;
  return lines.map((line) =>
    line.key === key && line.itemId === itemId
      ? { ...line, [field]: String(value) }
      : line,
  );
}
