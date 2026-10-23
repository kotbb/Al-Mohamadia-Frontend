"use client";

import { isUsableLine } from "@/app/modules/shared/utils/line-validation";
import { useItemDimensionDefaults } from "@/app/modules/items/hooks/use-item-dimension-defaults";
import type { DimensionName } from "@/app/modules/items/types/items.types";
import { applySavedDimension } from "@/app/modules/shared/utils/saved-dimension";

import type { UsePurchaseFormOptions } from "../types/use-purchase-form.types";
import { newLine, lineTotalForPurchaseLine } from "../utils/purchase-form";
import { isMoneyAmount } from "@/app/modules/shared/utils/money-validation";
import { parsePositive } from "@/app/modules/shared/utils/form-numbers";
import { moneyFieldString } from "@/app/modules/shared/utils/format-money";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getSupplier,
  listSuppliers,
} from "@/app/modules/suppliers/services/suppliers.service";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { createPurchase, updatePurchase } from "@/app/modules/purchases/services/purchases.service";
import type {
  CreatePurchaseInvoiceInput,
  CreatePurchaseInvoiceLineInput,
  PurchaseLineFormState,
  PurchaseInvoice,
} from "@/app/modules/purchases/types/purchases.types";
import { roundMoney } from "@/app/modules/shared/utils/invoice-math";
import { getItem, listItems } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";
import { initialDimensions } from "@/app/modules/items/utils/dimension-defaults";
import { roundMoneyAmount } from "@/app/modules/shared/utils/format-money";
import { accountBalanceAfterInvoice, parseAccountPayment, splitInvoicePayment } from "@/app/modules/shared/utils/account-payment";

const SEARCH_DEBOUNCE_MS = 300;

export function usePurchaseForm(options?: UsePurchaseFormOptions) {
  const describeError = useApiErrorMessage();
  const [editInvoice, setEditInvoice] = useState<PurchaseInvoice | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(
    options?.initialSupplierId ?? null,
  );
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [originalSupplier, setOriginalSupplier] = useState<Supplier | null>(null);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [allSuppliersLoading, setAllSuppliersLoading] = useState(true);
  const [supplierQuery, setSupplierQuery] = useState("");
  const supplierSearchVersion = useRef(0);
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
        setItems((previous) => {
          const merged = new Map(previous.map((item) => [item.id, item]));
          for (const item of result) {
            merged.set(item.id, item);
          }
          return [...merged.values()];
        });
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
    supplierSearchVersion.current += 1;
    setSupplierQuery(q);
    setSupplierResults([]);
    setSuppliersLoading(Boolean(q.trim()));
  }

  // Search suppliers
  useEffect(() => {
    const q = supplierQuery.trim();
    const version = supplierSearchVersion.current;
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
          if (!controller.signal.aborted && version === supplierSearchVersion.current) setSupplierResults(result.items);
        })
        .catch(() => {
          if (!controller.signal.aborted && version === supplierSearchVersion.current) setSupplierResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted && version === supplierSearchVersion.current) setSuppliersLoading(false);
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

  const initializeForEdit = useCallback(async (purchase: PurchaseInvoice) => {
    const [supplier, loadedItems] = await Promise.all([
      getSupplier(purchase.supplierId),
      Promise.all([...new Set(purchase.lines.map((line) => line.itemId))].map((id) => getItem(id))),
    ]);
    setItems((previous) => {
      const merged = new Map(previous.map((item) => [item.id, item]));
      for (const item of loadedItems) merged.set(item.id, item);
      return [...merged.values()];
    });
    setEditInvoice(purchase);
    setSupplierId(supplier.id);
    setSelectedSupplier(supplier);
    setOriginalSupplier(supplier);
    setLines(purchase.lines.map((line, index) => ({
      key: `edit-${index}-${line.itemId}`,
      itemId: line.itemId,
      quantity: String(line.quantity),
      unitCost: String(line.unitCost),
      widthM: line.width == null ? "" : String(line.width),
      lengthM: line.length == null ? "" : String(line.length),
      thicknessM: line.thickness == null ? "" : String(line.thickness),
      note: line.note ?? "",
    })));
    setPaidInput(String(purchase.paid));
    setNotes(purchase.notes ?? "");
    setSubmitError(null);
  }, []);

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
  const originalRemainingInSelectedSupplier = editInvoice && editInvoice.supplierId === selectedSupplier?.id
    ? editInvoice.remaining : 0;
  const accountPaymentAmount = splitInvoicePayment(paidValue, total).accountPaymentAmount;
  const accountBalance = selectedSupplier ? accountBalanceAfterInvoice(
    selectedSupplier.amountOwed, remaining, accountPaymentAmount, originalRemainingInSelectedSupplier,
  ) : undefined;

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
    const previous = lines.find((line) => line.key === key);
    if (previous?.itemId === itemId) return;
    const item = itemsById.get(itemId);
    const previousWasFree = itemsById.get(previous?.itemId ?? "")?.pricingMode === "free_amount";
    const isFreeAmount = item?.pricingMode === "free_amount";
    const dimensions = initialDimensions(isFreeAmount ? undefined : item?.dimensionDefaults);
    updateLine(key, {
      itemId,
      quantity: isFreeAmount || previousWasFree ? "1" : previous?.quantity ?? "1",
      unitCost: !isFreeAmount && item && item.cost > 0 ? String(item.cost) : "",
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
    if (selectedSupplier && !selectedSupplier.isActive && selectedSupplier.id !== editInvoice?.supplierId) {
      return t("validationSupplier");
    }
    const filled = snapshotLines.filter((line) => line.itemId);
    if (filled.length === 0) return t("validationLines");

    for (const line of snapshotLines) {
      if (!line.itemId) continue;
      const item = itemsById.get(line.itemId);
      if (!item) return t("validationItem");
      if (!item.isActive && !editInvoice?.lines.some((original) => original.itemId === line.itemId)) return t("validationItem");
      if (item.pricingMode !== "free_amount" && parsePositive(line.quantity) === null) return t("validationQuantity");
      if (parsePositive(line.unitCost) === null) return t("validationUnitCost");
      if (item.pricingMode !== "free_amount" &&
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
    }

    return null;
  }

  async function submit(opts: {
    t: (key: string) => string;
  }): Promise<string | null> {
    if (isSubmitting) return null;
    if (parseAccountPayment(paidInput) === null) {
      setSubmitError(opts.t("validationPaidNegative"));
      return null;
    }
    if (lines.some((line) => itemsById.get(line.itemId)?.pricingMode === "free_amount" && (parsePositive(line.unitCost) === null || !isMoneyAmount(Number(line.unitCost))))) {
      setSubmitError(opts.t("validationAmount"));
      return null;
    }
    const snapshotLines = lines.map((line) => ({
      ...line,
      ...(itemsById.get(line.itemId)?.pricingMode === "free_amount" ? { quantity: "1", thicknessM: "", widthM: "", lengthM: "" } : {}),
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

    const snapshotPayment = splitInvoicePayment(snapshotPaid, snapshotTotal);
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
      paid: snapshotPayment.paid,
      accountPaymentAmount: snapshotPayment.accountPaymentAmount,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const saved = editInvoice
        ? await updatePurchase(editInvoice.id, { supplierId: payload.supplierId, lines: payload.lines, paid: payload.paid ?? 0, accountPaymentAmount: payload.accountPaymentAmount, notes: payload.notes })
        : await createPurchase(payload);
      return saved.id;
    } catch (e: unknown) {
      const message = describeError(e, editInvoice ? "Failed to update purchase invoice" : "Failed to create purchase invoice");
      setSubmitError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setEditInvoice(null);
    setOriginalSupplier(null);
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
    editInvoice,
    initializeForEdit,
    supplierId,
    selectedSupplier,
    originalSupplier,
    allSuppliers,
    allSuppliersLoading,
    supplierQuery,
    setSupplierQuery: handleSupplierQueryChange,
    supplierResults,
    suppliersLoading,
    selectSupplier,
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
    accountPaymentAmount,
    accountBalance,
    notes,
    setNotes: handleNotesChange,

    total,
    paidValue,
    remaining,

    isSubmitting,
    submitError,
    submit,
    resetForm,
  };
}
