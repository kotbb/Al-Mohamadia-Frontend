"use client";

import { isMoneyAmount } from "@/app/modules/shared/utils/money-validation";

import type {
  LoadStatus,
  ItemFormValues,
  UseItemFormResult,
} from "../types/use-item-form.types";
import { parseOptionalNumber } from "../utils/item-form-parsing";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  dimensionDefaultsForForm,
  parseDimensionDefaults,
} from "@/app/modules/items/utils/dimension-defaults";

import { listCategories } from "@/app/modules/items/services/categories.service";
import {
  createItem,
  getItem,
  updateItem,
  updatePricing,
} from "@/app/modules/items/services/items.service";
import type {
  Category,
  CreateItemInput,
  Item,
  UpdateItemInput,
} from "@/app/modules/items/types/items.types";

const emptyFormValues: ItemFormValues = {
  dimensionDefaults: dimensionDefaultsForForm(),
  name: "",
  categoryId: "",
  pricingMode: "per_piece",
  unitPrice: "",
  cost: "",
  reorderThreshold: "",
  stockQuantity: "0",
  isActive: true,
};

export function useItemForm(itemId?: string): UseItemFormResult {
  const describeError = useApiErrorMessage();
  const t = useTranslations("items");
  const shared = useTranslations("shared");
  const isEdit = Boolean(itemId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesStatus, setCategoriesStatus] =
    useState<LoadStatus>("loading");
  const [item, setItem] = useState<Item | null>(null);
  const [itemStatus, setItemStatus] = useState<LoadStatus>(
    isEdit ? "loading" : "success",
  );
  const [itemError, setItemError] = useState<string | null>(null);
  const [values, setValues] = useState<ItemFormValues>(emptyFormValues);
  const [initialPricing, setInitialPricing] = useState({
    unitPrice: 0,
    cost: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    listCategories(controller.signal)
      .then((result) => {
        setCategories(result.filter((category) => !category.isDeleted));
        setCategoriesStatus("success");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setCategories([]);
        setCategoriesStatus("error");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!itemId) return;
    const controller = new AbortController();

    getItem(itemId, controller.signal)
      .then((loaded) => {
        setItem(loaded);
        setValues({
          dimensionDefaults: dimensionDefaultsForForm(loaded.dimensionDefaults),
          name: loaded.name,
          categoryId: loaded.category.id,
          pricingMode: loaded.pricingMode,
          unitPrice: String(loaded.unitPrice),
          cost: String(loaded.cost),
          reorderThreshold:
            loaded.reorderThreshold > 0 ? String(loaded.reorderThreshold) : "",
          stockQuantity: String(loaded.stockQuantity),
          isActive: loaded.isActive,
        });
        setInitialPricing({ unitPrice: loaded.unitPrice, cost: loaded.cost });
        setItemStatus("success");
        setItemError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(error, "Request failed");
        setItem(null);
        setItemStatus("error");
        setItemError(message);
      });

    return () => controller.abort();
  }, [itemId]);

  const setField = useCallback(
    <K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) => {
      if (isEdit && key === "pricingMode") return;
      setValues((current) => ({ ...current, [key]: value }));
    },
    [isEdit],
  );

  const submit = useCallback(async (): Promise<boolean> => {
    const isFreeAmount = values.pricingMode === "free_amount";
    const numericValues = isFreeAmount ? [] : [values.unitPrice, values.cost, values.reorderThreshold, ...(!isEdit ? [values.stockQuantity] : [])];
    if (numericValues.some((value) => value.trim() && (!Number.isFinite(Number(value)) || Number(value) < 0)) ||
      (!isFreeAmount && [values.unitPrice, values.cost].some((value) => value.trim() && !isMoneyAmount(Number(value))))) {
      setSubmitError(shared("validationNumbers"));
      return false;
    }
    if (!values.name.trim()) {
      setSubmitError(shared("requiredText"));
      return false;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const unitPrice = parseOptionalNumber(values.unitPrice);
    const cost = parseOptionalNumber(values.cost);
    const reorderThreshold = parseOptionalNumber(values.reorderThreshold);
    const stockQuantity = parseOptionalNumber(values.stockQuantity);

    try {
      const dimensionDefaults = isFreeAmount
        ? { thickness: [], width: [], length: [] }
        : parseDimensionDefaults(values.dimensionDefaults);
      if (!dimensionDefaults) {
        setSubmitError(t("validationDimensionDefaults"));
        return false;
      }
      if (!isEdit) {
        const input: CreateItemInput = {
          name: values.name.trim(),
          categoryId: values.categoryId,
          pricingMode: values.pricingMode,
          isActive: values.isActive,
          ...(!isFreeAmount && { dimensionDefaults, unitPrice: unitPrice ?? undefined, cost: cost ?? undefined, reorderThreshold: reorderThreshold ?? undefined, stockQuantity: stockQuantity ?? undefined }),
        };
        await createItem(input);
        return true;
      }

      if (!itemId) return false;

      const masterInput: UpdateItemInput = {
        name: values.name.trim(),
        categoryId: values.categoryId,
        isActive: values.isActive,
        ...(!isFreeAmount && { dimensionDefaults, reorderThreshold: reorderThreshold ?? undefined }),
      };
      await updateItem(itemId, masterInput);

      const nextUnitPrice = unitPrice ?? initialPricing.unitPrice;
      const nextCost = cost ?? initialPricing.cost;
      const pricingChanged =
        nextUnitPrice !== initialPricing.unitPrice ||
        nextCost !== initialPricing.cost;

      if (pricingChanged && !isFreeAmount) {
        await updatePricing(itemId, {
          unitPrice: nextUnitPrice,
          cost: nextCost,
        });
      }

      return true;
    } catch (error: unknown) {
      const message = describeError(error, "Save failed");
      setSubmitError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    shared,
    isEdit,
    itemId,
    values,
    initialPricing,
    describeError,
    t,
  ]);

  return {
    categories,
    categoriesStatus,
    item,
    itemStatus,
    itemError,
    values,
    setField,
    isSubmitting,
    submitError,
    submit,
  };
}
