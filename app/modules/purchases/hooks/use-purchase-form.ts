"use client";

import { isUsableLine } from "@/app/modules/shared/utils/line-validation";
import { useItemDimensionDefaults } from "@/app/modules/items/hooks/use-item-dimension-defaults";
import type { DimensionName } from "@/app/modules/items/types/items.types";
import { applySavedDimension } from "@/app/modules/shared/utils/saved-dimension";

import type { UsePurchaseFormOptions } from "../types/use-purchase-form.types";
import { newLine, lineTotalForPurchaseLine } from "../utils/purchase-form";
import { parsePositive } from "@/app/modules/shared/utils/form-numbers";
import { moneyFieldString } from "@/app/modules/shared/utils/format-money";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getSupplier,
  listSuppliers,
} from "@/app/modules/suppliers/services/suppliers.service";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { createPurchase } from "@/app/modules/purchases/services/purchases.service";
import type {
  CreatePurchaseInvoiceInput,
  CreatePurchaseInvoiceLineInput,
  PurchaseLineFormState,
} from "@/app/modules/purchases/types/purchases.types";
import { roundMoney } from "@/app/modules/shared/utils/invoice-math";
import { listItems } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";
import { initialDimensions } from "@/app/modules/items/utils/dimension-defaults";
import { roundMoneyAmount } from "@/app/modules/shared/utils/format-money";

const SEARCH_DEBOUNCE_MS = 300;

export function usePurchaseForm(options?: UsePurchaseFormOptions) {
  const describeError = useApiErrorMessage();
  const [supplierId, setSupplierId] = useState<string | null>(
    options?.initialSupplierId ?? null,
  );
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [allSuppliersLoading, setAllSuppliersLoading] = useState(true);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const saveItemDefault = useItemDimensionDefaults(setItems);
  const selectionVersions = useRef(new Map<string, number>());

  const [itemsStatus, setItemsStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("loading");
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [lines, setLines] = useState<PurchaseLineFormState[]>([newLine()]);
  const [paidInput, setPaidInput] = useState("0");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load active items
  useEffect(() => {
    const controller = new AbortController();
    listItems({ isActive: true }, controller.signal)
      .then((result) => {
        setItems(result.filter((item) => item.pricingMode !== "free_amount"));
        setItemsStatus("success");
        setItemsError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setItemsStatus("error");
        setItemsError(describeError(error, "Failed to load items"));
      });
    return () => controller.abort();
  }, []);

  // Load all active suppliers for dropdown
  useEffect(() => {
    const controller = new AbortController();
    listSuppliers({ isActive: true, page: 1, limit: 100 }, controller.signal)
      .then((res) => {
        setAllSuppliers(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setAllSuppliersLoading(false);
      });
    return () => controller.abort();
  }, []);

  function handleSupplierQueryChange(q: string) {
    setSupplierQuery(q);
    if (!q.trim()) {
      setSupplierResults([]);
      setSuppliersLoading(false);
    }
  }

  // Search suppliers
  useEffect(() => {
    const q = supplierQuery.trim();
    if (!q) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSuppliersLoading(true);
      listSuppliers(
        { q, isActive: true, page: 1, limit: 10 },
        controller.signal,
      )
        .then((result) => {
          setSupplierResults(result.items);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSupplierResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSuppliersLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [supplierQuery]);

  // If initialSupplierId provided, fetch supplier details asynchronously
  const initialSupplierId = options?.initialSupplierId;
  useEffect(() => {
    if (!initialSupplierId) return;
    const controller = new AbortController();
    getSupplier(initialSupplierId, controller.signal)
      .then((s) => {
        setSupplierId(s.id);
        setSelectedSupplier(s);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [initialSupplierId]);

  const itemsById = useMemo(() => {
    const map = new Map<string, Item>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const lineTotals = useMemo(() => {
    return lines.map((line) => lineTotalForPurchaseLine(line, itemsById));
  }, [lines, itemsById]);

  const total = useMemo(() => {
    return roundMoney(lineTotals.reduce((sum, n) => sum + n, 0));
  }, [lineTotals]);

  const paidValue = useMemo(() => {
    if (!paidInput.trim()) return 0;
    const n = Number(paidInput);
    if (!Number.isFinite(n) || n < 0) return 0;
    return roundMoney(n);
  }, [paidInput]);

  const remaining = useMemo(() => {
    return roundMoney(Math.max(0, total - paidValue));
  }, [total, paidValue]);
  const totalDue = roundMoney(total + (selectedSupplier?.amountOwed ?? 0));

  function selectSupplier(supplier: Supplier) {
    setSupplierId(supplier.id);
    setSelectedSupplier(supplier);
    setSupplierQuery("");
    setSupplierResults([]);
    setSubmitError(null);
  }

  function clearSupplier() {
    setSupplierId(null);
    setSelectedSupplier(null);
    setSubmitError(null);
  }

  function selectSupplierById(id: string) {
    if (!id) {
      clearSupplier();
      return;
    }
    const found =
      allSuppliers.find((s) => s.id === id) ||
      supplierResults.find((s) => s.id === id);
    if (found) {
      selectSupplier(found);
    } else {
      getSupplier(id)
        .then((s) => selectSupplier(s))
        .catch(() => {});
    }
  }

  function addLine() {
    setLines((prev) => [...prev, newLine()]);
    setSubmitError(null);
  }

  function duplicateLine(key: string) {
    setLines((prev) => {
      const index = prev.findIndex((line) => line.key === key);
      if (index === -1) return prev;
      const copy = { ...prev[index], key: newLine().key };
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
    setSubmitError(null);
  }

  function removeLine(key: string) {
    selectionVersions.current.set(
      key,
      (selectionVersions.current.get(key) ?? 0) + 1,
    );
    setLines((prev) =>
      prev.length <= 1 ? prev : prev.filter((l) => l.key !== key),
    );
    setSubmitError(null);
  }

  function updateLine(key: string, patch: Partial<PurchaseLineFormState>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
    setSubmitError(null);
  }

  async function addDimensionDefault(
    key: string,
    itemId: string,
    dimension: DimensionName,
    value: number,
  ) {
    const version = selectionVersions.current.get(key) ?? 0;
    await saveItemDefault(itemId, dimension, value);
    const isCurrent = (selectionVersions.current.get(key) ?? 0) === version;
    setLines((current) =>
      applySavedDimension(
        current,
        key,
        itemId,
        `${dimension}M`,
        value,
        isCurrent,
      ),
    );
  }

  function selectItem(key: string, itemId: string) {
    selectionVersions.current.set(
      key,
      (selectionVersions.current.get(key) ?? 0) + 1,
    );
    const item = itemsById.get(itemId);
    const dimensions = initialDimensions(item?.dimensionDefaults);
    updateLine(key, {
      itemId,
      unitCost: item && item.cost > 0 ? String(item.cost) : "",
      thicknessM: dimensions.thickness,
      widthM: dimensions.width,
      lengthM: dimensions.length,
    });
    setSubmitError(null);
  }

  function handlePaidChange(val: string) {
    setPaidInput(val);
    setSubmitError(null);
  }

  function handleNotesChange(val: string) {
    setNotes(val);
    setSubmitError(null);
  }

  function validationError(
    snapshotLines: PurchaseLineFormState[],
    snapshotPaidInput: string,
    snapshotTotal: number,
    t: (key: string) => string,
  ): string | null {
    if (!supplierId) {
      return t("validationSupplier");
    }
    const filled = snapshotLines.filter((line) => line.itemId);
    if (filled.length === 0) return t("validationLines");

    for (const line of snapshotLines) {
      if (!line.itemId) continue;
      const item = itemsById.get(line.itemId);
      if (!item || item.pricingMode === "free_amount") return t("validationItem");
      if (parsePositive(line.quantity) === null) return t("validationQuantity");
      if (parsePositive(line.unitCost) === null) return t("validationUnitCost");
      if (
        [line.thicknessM, line.widthM, line.lengthM].some(
          (value) => value.trim() && parsePositive(value) === null,
        )
      )
        return t("validationOptionalDims");
      if (!isUsableLine({ pricingMode: item.pricingMode, quantity: Number(line.quantity), piecePrice: Number(line.unitCost), thicknessM: Number(line.thicknessM), widthM: Number(line.widthM), lengthM: Number(line.lengthM) })) return t("validationCalculation");
      if (item.pricingMode === "per_cubic_meter") {
        if (
          parsePositive(line.thicknessM) === null ||
          parsePositive(line.widthM) === null ||
          parsePositive(line.lengthM) === null
        ) {
          return t("validationDims");
        }
      }
    }

    if (!Number.isFinite(snapshotTotal)) return t("validationCalculation");
    if (snapshotPaidInput.trim() !== "") {
      const rawPaid = Number(snapshotPaidInput);
      if (!Number.isFinite(rawPaid) || rawPaid < 0) {
        return t("validationPaidNegative");
      }
      if (rawPaid > roundMoney(snapshotTotal + (selectedSupplier?.amountOwed ?? 0))) {
        return t("validationPaidExceedsTotal");
      }
    }

    return null;
  }

  async function submit(opts: {
    t: (key: string) => string;
  }): Promise<string | null> {
    const snapshotLines = lines.map((line) => ({
      ...line,
      unitCost: moneyFieldString(line.unitCost),
    }));
    const paidRounded = roundMoneyAmount(paidInput);
    const snapshotPaidInput =
      paidRounded === null ? paidInput : String(paidRounded);
    const snapshotPaid =
      paidRounded ??
      (snapshotPaidInput.trim() === "" ? 0 : Number(snapshotPaidInput));
    const snapshotTotal = roundMoney(
      snapshotLines.reduce(
        (sum, line) => sum + lineTotalForPurchaseLine(line, itemsById),
        0,
      ),
    );

    setLines(snapshotLines);
    setPaidInput(snapshotPaidInput);

    const err = validationError(
      snapshotLines,
      snapshotPaidInput,
      snapshotTotal,
      opts.t,
    );
    if (err) {
      setSubmitError(err);
      return null;
    }

    if (!supplierId) return null;

    const payloadLines: CreatePurchaseInvoiceLineInput[] = snapshotLines
      .filter((line) => Boolean(line.itemId))
      .map((line) => {
        const quantity = parsePositive(line.quantity) ?? 1;
        const unitCost = roundMoney(parsePositive(line.unitCost) ?? 0);
        const note = line.note.trim() ? line.note.trim() : undefined;

        return {
          itemId: line.itemId,
          quantity,
          unitCost,
          thickness: parsePositive(line.thicknessM) ?? undefined,
          width: parsePositive(line.widthM) ?? undefined,
          length: parsePositive(line.lengthM) ?? undefined,
          note,
        };
      });

    const payload: CreatePurchaseInvoiceInput = {
      supplierId,
      lines: payloadLines,
      paid: roundMoney(Math.min(Number.isFinite(snapshotPaid) ? snapshotPaid : 0, snapshotTotal)),
      existingDebtPayment: roundMoney(Math.max(0, (Number.isFinite(snapshotPaid) ? snapshotPaid : 0) - snapshotTotal)),
      notes: notes.trim() ? notes.trim() : undefined,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await createPurchase(payload);
      return created.id;
    } catch (e: unknown) {
      const message = describeError(e, "Failed to create purchase invoice");
      setSubmitError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setSupplierId(null);
    setSelectedSupplier(null);
    setSupplierQuery("");
    setSupplierResults([]);
    setLines([newLine()]);
    setPaidInput("0");
    setNotes("");
    setSubmitError(null);
  }

  return {
    supplierId,
    selectedSupplier,
    allSuppliers,
    allSuppliersLoading,
    supplierQuery,
    setSupplierQuery: handleSupplierQueryChange,
    supplierResults,
    suppliersLoading,
    selectSupplier,
    selectSupplierById,
    clearSupplier,

    items,
    itemsStatus,
    itemsError,
    itemsById,

    lines,
    lineTotals,
    addLine,
    duplicateLine,
    removeLine,
    updateLine,
    selectItem,
    addDimensionDefault,

    paidInput,
    setPaidInput: handlePaidChange,
    notes,
    setNotes: handleNotesChange,

    total,
    paidValue,
    remaining,
    totalDue,

    isSubmitting,
    submitError,
    submit,
    resetForm,
  };
}
