"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCustomer,
  listCustomers,
} from "@/app/modules/customers/services/customers.service";
import type { Customer } from "@/app/modules/customers/types/customers.types";
import {
  createSalesInvoice,
  getSalesInvoicePdfBlob,
  openPdfBlob,
} from "@/app/modules/invoices/services/invoices.service";
import type {
  CreateSalesInvoiceInput,
  SalesInvoiceType,
} from "@/app/modules/invoices/types/invoices.types";
import {
  computeInvoiceTotals,
  lineTotalForPricing,
  roundMoney,
} from "@/app/modules/invoices/utils/invoice-math";
import { listItems } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";
import { roundMoneyAmount } from "@/app/modules/items/utils/format-money";

export interface InvoiceFormLine {
  key: string;
  itemId: string;
  quantity: string;
  piecePrice: string;
  thickness: string;
  width: string;
  length: string;
  note: string;
}

function newLine(): InvoiceFormLine {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemId: "",
    quantity: "1",
    piecePrice: "",
    thickness: "",
    width: "",
    length: "",
    note: "",
  };
}

function parsePositive(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseNonNegative(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

const SEARCH_DEBOUNCE_MS = 300;

function moneyFieldString(raw: string): string {
  const rounded = roundMoneyAmount(raw);
  return rounded === null ? raw : String(rounded);
}

function lineTotalForFormLine(
  line: InvoiceFormLine,
  itemsById: Map<string, Item>,
): number {
  const item = itemsById.get(line.itemId);
  if (!item) return 0;
  const quantity = parsePositive(line.quantity);
  const piecePrice = parsePositive(line.piecePrice);
  if (quantity === null || piecePrice === null) return 0;
  const thickness =
    item.pricingMode === "per_cubic_meter"
      ? parsePositive(line.thickness)
      : null;
  const width =
    item.pricingMode === "per_cubic_meter" ? parsePositive(line.width) : null;
  const length =
    item.pricingMode === "per_cubic_meter" ? parsePositive(line.length) : null;
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
      piecePrice,
      thicknessCm: thickness,
      widthCm: width,
      lengthCm: length,
    }),
  );
}

export function useInvoiceForm() {
  const describeError = useApiErrorMessage();
  const [type, setType] = useState<SalesInvoiceType>("cash_sale");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allCustomersLoading, setAllCustomersLoading] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [itemsStatus, setItemsStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("loading");
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [lines, setLines] = useState<InvoiceFormLine[]>([newLine()]);
  const [discountInput, setDiscountInput] = useState("0");
  const [paidInput, setPaidInput] = useState("0");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setItemsStatus("loading");
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

  useEffect(() => {
    if (type !== "customer_sale") {
      setCustomerResults([]);
      setCustomersLoading(false);
      return;
    }

    const q = customerQuery.trim();
    if (!q) {
      setCustomerResults([]);
      setCustomersLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setCustomersLoading(true);
      listCustomers(
        { q, isActive: true, page: 1, limit: 10 },
        controller.signal,
      )
        .then((result) => {
          setCustomerResults(result.items);
        })
        .catch(() => {
          if (!controller.signal.aborted) setCustomerResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setCustomersLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [customerQuery, type]);

  useEffect(() => {
    if (type !== "customer_sale") return;
    const controller = new AbortController();
    setAllCustomersLoading(true);
    listCustomers({ isActive: true, page: 1, limit: 100 }, controller.signal)
      .then((res) => {
        setAllCustomers(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setAllCustomersLoading(false);
      });
    return () => controller.abort();
  }, [type]);

  const itemsById = useMemo(() => {
    const map = new Map<string, Item>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const lineTotals = useMemo(() => {
    return lines.map((line) => lineTotalForFormLine(line, itemsById));
  }, [lines, itemsById]);

  const discountValue = parseNonNegative(discountInput) ?? 0;
  const paidValue = parseNonNegative(paidInput) ?? 0;
  const totals = computeInvoiceTotals({
    lineTotals,
    discount: discountValue,
    paid: paidValue,
  });

  useEffect(() => {
    if (type === "cash_sale") {
      setPaidInput(String(totals.net));
    }
  }, [type, totals.net]);

  function setSaleType(next: SalesInvoiceType) {
    setType(next);
    setSubmitError(null);
    if (next === "cash_sale") {
      setCustomerId(null);
      setSelectedCustomer(null);
      setCustomerQuery("");
      setCustomerResults([]);
    }
  }

  function selectCustomer(customer: Customer) {
    setCustomerId(customer.id);
    setSelectedCustomer(customer);
    setCustomerQuery("");
    setCustomerResults([]);
  }

  function clearCustomer() {
    setCustomerId(null);
    setSelectedCustomer(null);
  }

  function selectCustomerById(id: string) {
    if (!id) {
      clearCustomer();
      return;
    }
    const found =
      allCustomers.find((c) => c.id === id) ||
      customerResults.find((c) => c.id === id);
    if (found) {
      selectCustomer(found);
    } else {
      getCustomer(id)
        .then((c) => selectCustomer(c))
        .catch(() => {});
    }
  }

  function addLine() {
    setLines((prev) => [...prev, newLine()]);
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
  }

  function updateLine(key: string, patch: Partial<InvoiceFormLine>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function selectItem(key: string, itemId: string) {
    const item = itemsById.get(itemId);
    updateLine(key, {
      itemId,
      piecePrice: item ? String(item.unitPrice) : "",
      thickness: "",
      width: "",
      length: "",
    });
  }

  function validationError(
    snapshotLines: InvoiceFormLine[],
    snapshotDiscount: number,
    snapshotPaid: number,
    snapshotTotals: { total: number; net: number },
    t: (key: string) => string,
  ): string | null {
    if (type === "customer_sale" && !customerId) {
      return t("validationCustomer");
    }
    const filled = snapshotLines.filter((line) => line.itemId);
    if (filled.length === 0) return t("validationLines");

    for (const line of snapshotLines) {
      if (!line.itemId) continue;
      const item = itemsById.get(line.itemId);
      if (!item) return t("validationItem");
      if (parsePositive(line.quantity) === null) return t("validationItem");
      if (parsePositive(line.piecePrice) === null) return t("validationItem");
      if (item.pricingMode === "per_cubic_meter") {
        if (
          parsePositive(line.thickness) === null ||
          parsePositive(line.width) === null ||
          parsePositive(line.length) === null
        ) {
          return t("validationDims");
        }
      }
    }

    if (snapshotDiscount > snapshotTotals.total) return t("validationDiscount");

    if (type === "cash_sale") {
      if (roundMoney(snapshotPaid) !== snapshotTotals.net) {
        return t("validationPaidCash");
      }
    } else if (snapshotPaid > snapshotTotals.net) {
      return t("validationPaidCustomer");
    }

    return null;
  }

  function buildPayload(
    snapshotLines: InvoiceFormLine[],
    snapshotDiscount: number,
    snapshotPaid: number,
  ): CreateSalesInvoiceInput {
    const payloadLines = snapshotLines
      .filter((line) => line.itemId)
      .map((line) => {
        const item = itemsById.get(line.itemId)!;
        const base = {
          itemId: line.itemId,
          quantity: parsePositive(line.quantity)!,
          piecePrice: roundMoney(parsePositive(line.piecePrice)!),
          note: line.note.trim() || undefined,
        };
        if (item.pricingMode === "per_cubic_meter") {
          return {
            ...base,
            thickness: parsePositive(line.thickness)!,
            width: parsePositive(line.width)!,
            length: parsePositive(line.length)!,
          };
        }
        return base;
      });

    return {
      type,
      customerId: type === "customer_sale" ? customerId! : undefined,
      lines: payloadLines,
      discount: roundMoney(snapshotDiscount),
      paid: roundMoney(snapshotPaid),
    };
  }

  async function submit(options: {
    print: boolean;
    t: (key: string) => string;
  }): Promise<string | null> {
    const snapshotLines = lines.map((line) => ({
      ...line,
      piecePrice: moneyFieldString(line.piecePrice),
    }));
    const discountRounded = roundMoneyAmount(discountInput);
    const snapshotDiscount =
      discountRounded ?? parseNonNegative(discountInput) ?? 0;
    const snapshotDiscountInput =
      discountRounded === null ? discountInput : String(discountRounded);
    const snapshotLineTotals = snapshotLines.map((line) =>
      lineTotalForFormLine(line, itemsById),
    );
    const preview = computeInvoiceTotals({
      lineTotals: snapshotLineTotals,
      discount: snapshotDiscount,
      paid: 0,
    });
    const paidRounded = roundMoneyAmount(paidInput);
    const snapshotPaid =
      type === "cash_sale"
        ? preview.net
        : (paidRounded ?? parseNonNegative(paidInput) ?? 0);
    const snapshotPaidInput =
      type === "cash_sale"
        ? String(preview.net)
        : paidRounded === null
          ? paidInput
          : String(paidRounded);
    const snapshotTotals = computeInvoiceTotals({
      lineTotals: snapshotLineTotals,
      discount: snapshotDiscount,
      paid: snapshotPaid,
    });

    setLines(snapshotLines);
    setDiscountInput(snapshotDiscountInput);
    setPaidInput(snapshotPaidInput);

    const error = validationError(
      snapshotLines,
      snapshotDiscount,
      snapshotPaid,
      snapshotTotals,
      options.t,
    );
    if (error) {
      setSubmitError(error);
      return null;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createSalesInvoice(
        buildPayload(snapshotLines, snapshotDiscount, snapshotPaid),
      );
      if (options.print) {
        try {
          const blob = await getSalesInvoicePdfBlob(created.id);
          openPdfBlob(blob);
        } catch {
          // Invoice was saved; print failure is non-blocking
        }
      }
      return created.id;
    } catch (error: unknown) {
      setSubmitError(
        describeError(error, "Save failed"),
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  const resetForm = useCallback(() => {
    setType("cash_sale");
    setCustomerId(null);
    setSelectedCustomer(null);
    setCustomerQuery("");
    setCustomerResults([]);
    setLines([newLine()]);
    setDiscountInput("0");
    setPaidInput("0");
    setSubmitError(null);
  }, []);

  return {
    type,
    setSaleType,
    customerId,
    selectedCustomer,
    allCustomers,
    allCustomersLoading,
    customerQuery,
    setCustomerQuery,
    customerResults,
    customersLoading,
    selectCustomer,
    selectCustomerById,
    clearCustomer,
    items,
    itemsById,
    itemsStatus,
    itemsError,
    lines,
    addLine,
    removeLine,
    updateLine,
    selectItem,
    lineTotals,
    discountInput,
    setDiscountInput,
    paidInput,
    setPaidInput,
    totals,
    isSubmitting,
    submitError,
    submit,
    resetForm,
  };
}
