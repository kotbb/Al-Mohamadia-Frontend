"use client";
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { DimensionName, Item } from "../types/items.types";
import { addItemDimensionDefault } from "../services/items.service";
import { mergeDimensionDefaults } from "../utils/dimension-defaults";

export function useItemDimensionDefaults(
  setItems: Dispatch<SetStateAction<Item[]>>,
) {
  return useCallback(
    async (itemId: string, dimension: DimensionName, value: number) => {
      const result = await addItemDimensionDefault(itemId, {
        dimension,
        value,
      });
      setItems((items) =>
        items.map((item) =>
          item.id === result.itemId
            ? {
                ...item,
                dimensionDefaults: mergeDimensionDefaults(
                  item.dimensionDefaults,
                  result.dimensionDefaults,
                ),
              }
            : item,
        ),
      );
    },
    [setItems],
  );
}
