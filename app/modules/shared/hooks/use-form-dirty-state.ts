"use client";

import { useCallback, useState } from "react";
import { formSnapshot } from "../utils/form-snapshot";

/** Features explicitly reset the baseline after hydration/open, never after ordinary edits. */
export function useFormDirtyState<T>(values: T) {
  const [baseline, setBaseline] = useState(() => formSnapshot(values));
  const resetBaseline = useCallback((next: T) => setBaseline(formSnapshot(next)), []);
  return { isDirty: formSnapshot(values) !== baseline, resetBaseline };
}
