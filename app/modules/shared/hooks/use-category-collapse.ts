"use client";

import { useState } from "react";

export function useCategoryCollapse(categoryIds: readonly string[]) {
  const [state, setState] = useState(() => ({
    collapsedByDefault: false,
    overrides: new Set<string>(),
  }));

  const isCategoryCollapsed = (categoryId: string) =>
    state.collapsedByDefault !== state.overrides.has(categoryId);

  const allCollapsed = categoryIds.length > 0 && categoryIds.every(isCategoryCollapsed);

  const toggleCategory = (categoryId: string) => {
    setState((previous) => {
      const overrides = new Set(previous.overrides);
      if (overrides.has(categoryId)) overrides.delete(categoryId);
      else overrides.add(categoryId);
      return { ...previous, overrides };
    });
  };

  const toggleAll = () => {
    setState({ collapsedByDefault: !allCollapsed, overrides: new Set<string>() });
  };

  return { isCategoryCollapsed, allCollapsed, toggleCategory, toggleAll };
}
