"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useEffect, useMemo, useState } from "react";
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
import {
  lineTotalForPricing,
  roundMoney,
} from "@/app/modules/invoices/utils/invoice-math";
import { listItems } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";
import { roundMoneyAmount } from "@/app/modules/items/utils/format-money";

function newLine(): PurchaseLineFormState {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemId: "",
    quantity: "1",
    unitCost: "",
    thicknessCm: "",
    widthCm: "",
    lengthCm: "",
    note: "",
  };
}

function parsePositive(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const SEARCH_DEBOUNCE_MS = 300;

function moneyFieldString(raw: string): string {
  const rounded = roundMoneyAmount(raw);
  return rounded === null ? raw : String(rounded);
}

function lineTotalForPurchaseLine(
  line: PurchaseLineFormState,
  itemsById: Map<string, Item>,
): number {
  const item = itemsById.get(line.itemId);
  if (!item) return 0;
  const quantity = parsePositive(line.quantity);
  const unitCost = parsePositive(line.unitCost);
  if (quantity === null || unitCost === null) return 0;
  const thickness =
    item.pricingMode === "per_cubic_meter"
      ? parsePositive(line.thicknessCm)
      : null;
  const width =
    item.pricingMode === "per_cubic_meter" ? parsePositive(line.widthCm) : null;
  const length =
    item.pricingMode === "per_cubic_meter"
      ? parsePositive(line.lengthCm)
      : null;
  if (
    item.pricingMode === "per_cubic_meter" &&
    (thickness === null || width === null || length === null)
  ) {
    return 0;
  }
  return roundMoney(
    lineTotalForPricing({
      pricingMode: item.pricingMode,
      quantity,
      piecePrice: unitCost,
      thicknessCm: thickness,
      widthCm: width,
      lengthCm: length,
    }),
  );
}

interface UsePurchaseFormOptions {
  initialSupplierId?: string | null;
}

export function usePurchaseForm(options?: UsePurchaseFormOptions) {
  const describeError = useApiErrorMessage();
  const [supplierId, setSupplierId] = useState<string | null>(
    options?.initialSupplierId ?? null,
  );
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [allSuppliersLoading, setAllSuppliersLoading] = useState(true);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
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
        setItems(result);
        setItemsStatus("success");
        setItemsError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setItemsStatus("error");
        setItemsError(
          describeError(error, "Failed to load items"),
        );
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

  function removeLine(key: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
    setSubmitError(null);
  }

  function updateLine(key: string, patch: Partial<PurchaseLineFormState>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
    setSubmitError(null);
  }

  function selectItem(key: string, itemId: string) {
    const item = itemsById.get(itemId);
    updateLine(key, {
      itemId,
      unitCost: item && item.cost > 0 ? String(item.cost) : "",
      thicknessCm: "",
      widthCm: "",
      lengthCm: "",
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
      if (!item) return t("validationItem");
      if (parsePositive(line.quantity) === null) return t("validationQuantity");
      if (parsePositive(line.unitCost) === null) return t("validationUnitCost");
      if (item.pricingMode === "per_cubic_meter") {
        if (
          parsePositive(line.thicknessCm) === null ||
          parsePositive(line.widthCm) === null ||
          parsePositive(line.lengthCm) === null
        ) {
          return t("validationDims");
        }
      }
    }

    if (snapshotPaidInput.trim() !== "") {
      const rawPaid = Number(snapshotPaidInput);
      if (!Number.isFinite(rawPaid) || rawPaid < 0) {
        return t("validationPaidNegative");
      }
      if (rawPaid > snapshotTotal) {
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
        const item = itemsById.get(line.itemId);
        const isCubic = item?.pricingMode === "per_cubic_meter";
        const quantity = parsePositive(line.quantity) ?? 1;
        const unitCost = roundMoney(parsePositive(line.unitCost) ?? 0);
        const note = line.note.trim() ? line.note.trim() : undefined;

        if (isCubic) {
          return {
            itemId: line.itemId,
            quantity,
            unitCost,
            thickness: parsePositive(line.thicknessCm) ?? undefined,
            width: parsePositive(line.widthCm) ?? undefined,
            length: parsePositive(line.lengthCm) ?? undefined,
            note,
          };
        }

        return {
          itemId: line.itemId,
          quantity,
          unitCost,
          note,
        };
      });

    const payload: CreatePurchaseInvoiceInput = {
      supplierId,
      lines: payloadLines,
      paid: roundMoney(Number.isFinite(snapshotPaid) ? snapshotPaid : 0),
      notes: notes.trim() ? notes.trim() : undefined,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await createPurchase(payload);
      return created.id;
    } catch (e: unknown) {
      const message =
        describeError(e, "Failed to create purchase invoice");
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
    removeLine,
    updateLine,
    selectItem,

    paidInput,
    setPaidInput: handlePaidChange,
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
