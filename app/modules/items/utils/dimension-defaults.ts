import type { DimensionDefaultsForm } from "../types/dimension-defaults-form.types";
import type { DimensionDefaults } from "@/app/modules/items/types/items.types";

export function mergeDimensionDefaults(
  current: DimensionDefaults | undefined,
  incoming: DimensionDefaults,
): DimensionDefaults {
  const merge = (old: number[] = [], next: number[] = []) =>
    [...new Set([...old, ...next])].sort((a, b) => a - b);
  return {
    thickness: merge(current?.thickness, incoming.thickness),
    width: merge(current?.width, incoming.width),
    length: merge(current?.length, incoming.length),
  };
}

export function dimensionDefaultsForForm(
  defaults?: DimensionDefaults,
): DimensionDefaultsForm {
  const values = (entries?: number[]) =>
    entries?.length ? entries.map(String) : [""];
  return {
    thickness: values(defaults?.thickness),
    width: values(defaults?.width),
    length: values(defaults?.length),
  };
}

export function initialDimensions(
  defaults?: DimensionDefaults,
): Record<keyof DimensionDefaults, string> {
  const value = (entries?: number[]) =>
    entries?.length === 1 ? String(entries[0]) : "";
  return {
    thickness: value(defaults?.thickness),
    width: value(defaults?.width),
    length: value(defaults?.length),
  };
}

export function parseDimensionDefaults(
  form: DimensionDefaultsForm,
): DimensionDefaults | null {
  const result: DimensionDefaults = { thickness: [], width: [], length: [] };
  for (const dimension of ["thickness", "width", "length"] as const) {
    const values = form[dimension]
      .filter((value) => value.trim() !== "")
      .map(Number);
    if (values.some((value) => !Number.isFinite(value) || value <= 0))
      return null;
    result[dimension] = [...new Set(values)].sort((a, b) => a - b);
  }
  return result;
}
