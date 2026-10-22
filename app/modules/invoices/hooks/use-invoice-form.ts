"use client";

import { isUsableLine } from "@/app/modules/shared/utils/line-validation";
import { useItemDimensionDefaults } from "@/app/modules/items/hooks/use-item-dimension-defaults";
import type { DimensionName } from "@/app/modules/items/types/items.types";
import { applySavedDimension } from "@/app/modules/shared/utils/saved-dimension";

import type { InvoiceFormLine } from "../types/use-invoice-form.types";
import { newLine, lineTotalForFormLine } from "../utils/invoice-form";
import {
  parsePositive,
  parseNonNegative,
} from "@/app/modules/shared/utils/form-numbers";
import { moneyFieldString } from "@/app/modules/shared/utils/format-money";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCustomer,
  listCustomers,
} from "@/app/modules/customers/services/customers.service";
import type { Customer } from "@/app/modules/customers/types/customers.types";
import {
  createSalesInvoice,
  updateSalesInvoice,
} from "@/app/modules/invoices/services/invoices.service";
import type {
  CreateSalesInvoiceInput,
  SalesInvoice,
  SalesInvoiceType,
} from "@/app/modules/invoices/types/invoices.types";
import {
  computeInvoiceTotals,
  roundMoney,
} from "@/app/modules/shared/utils/invoice-math";
import { getItem, listItems } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";
import { initialDimensions } from "@/app/modules/items/utils/dimension-defaults";
import { roundMoneyAmount } from "@/app/modules/shared/utils/format-money";
import { accountBalanceAfterInvoice, parseAccountPayment, splitInvoicePayment } from "@/app/modules/shared/utils/account-payment";
import type { UseInvoiceFormOptions } from "../types/use-invoice-form.types";

const SEARCH_DEBOUNCE_MS = 300;

export function useInvoiceForm(options?: UseInvoiceFormOptions) {
  const describeError = useApiErrorMessage();
  const [type, setType] = useState<SalesInvoiceType>("customer_sale");
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
  const saveItemDefault = useItemDimensionDefaults(setItems);
  const selectionVersions = useRef(new Map<string, number>());

  const [itemsStatus, setItemsStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("loading");
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [originalItemIds, setOriginalItemIds] = useState<string[]>([]);

  const [lines, setLines] = useState<InvoiceFormLine[]>([newLine()]);
  const [discountInput, setDiscountInput] = useState("0");
  const [paidInput, setPaidInput] = useState("0");
  const [originalInvoice, setOriginalInvoice] = useState<SalesInvoice | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialCustomerId = options?.initialCustomerId;
  useEffect(() => {
    if (!initialCustomerId) return;
    const controller = new AbortController();
    setType("customer_sale");
    getCustomer(initialCustomerId, controller.signal).then((customer) => {
      if (controller.signal.aborted) return;
      setCustomerId(customer.id);
      setSelectedCustomer(customer);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setSubmitError(describeError(error, "Failed to load customer"));
    });
    return () => controller.abort();
  }, [initialCustomerId]);

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
        setItemsError(describeError(error, "Failed to load items"));
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
          if (controller.signal.aborted) return;
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

  // Load missing items for existing lines (e.g. inactive items on edit)
  useEffect(() => {
    const missingIds = [
      ...new Set(
        lines.map((l) => l.itemId).filter((id) => id && !itemsById.has(id)),
      ),
    ];
    if (missingIds.length === 0) return;
    const controller = new AbortController();
    Promise.all(
      missingIds.map((id) => getItem(id, controller.signal).catch(() => null)),
    ).then((fetched) => {
      const valid = fetched.filter((i): i is Item => i !== null);
      if (valid.length > 0) {
        setItems((prev) => {
          const currentMap = new Map(prev.map((i) => [i.id, i]));
          let changed = false;
          for (const item of valid) {
            if (!currentMap.has(item.id)) {
              currentMap.set(item.id, item);
              changed = true;
            }
          }
          return changed ? Array.from(currentMap.values()) : prev;
        });
      }
    });
    return () => controller.abort();
  }, [lines, itemsById]);

  // Identify any selected items that are currently inactive
  const inactiveItemNames = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    for (const line of lines) {
      if (!line.itemId || seen.has(line.itemId)) continue;
      seen.add(line.itemId);
      const item = itemsById.get(line.itemId);
      if (item && !item.isActive && !originalItemIds.includes(line.itemId)) {
        names.push(item.name);
      }
    }
    return names;
  }, [lines, itemsById, originalItemIds]);

  const lineTotals = useMemo(() => {
    return lines.map((line) => lineTotalForFormLine(line, itemsById));
  }, [lines, itemsById]);

  const discountValue = parseNonNegative(discountInput) ?? 0;
  const paidValue = parseNonNegative(paidInput) ?? 0;
  const enteredTotals = computeInvoiceTotals({
    lineTotals,
    discount: discountValue,
    paid: paidValue,
  });
  const paymentParts = splitInvoicePayment(enteredTotals.paid, enteredTotals.net);
  const totals = { ...enteredTotals, paid: paymentParts.paid, remaining: paymentParts.remaining };
  const accountPaymentAmount = type === "customer_sale" ? paymentParts.accountPaymentAmount : 0;
  const previousInvoiceRemaining = originalInvoice?.customerId === selectedCustomer?.id
    ? originalInvoice?.remaining ?? 0 : 0;
  const accountBalance = selectedCustomer ? accountBalanceAfterInvoice(
    selectedCustomer.balance, totals.remaining, accountPaymentAmount, previousInvoiceRemaining,
  ) : undefined;

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

  function handleCustomerQueryChange(value: string) {
    setCustomerQuery(value);
    setCustomerResults([]);
    setCustomersLoading(Boolean(value.trim()));
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

  function duplicateLine(key: string) {
    setLines((prev) => {
      const index = prev.findIndex((line) => line.key === key);
      if (index === -1) return prev;
      const copy = { ...prev[index], key: newLine().key };
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  }

  function removeLine(key: string) {
    selectionVersions.current.set(
      key,
      (selectionVersions.current.get(key) ?? 0) + 1,
    );
    setLines((prev) =>
      prev.length <= 1 ? prev : prev.filter((l) => l.key !== key),
    );
  }

  function updateLine(key: string, patch: Partial<InvoiceFormLine>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
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
      applySavedDimension(current, key, itemId, dimension, value, isCurrent),
    );
  }

  function selectItem(key: string, itemId: string) {
    selectionVersions.current.set(
      key,
      (selectionVersions.current.get(key) ?? 0) + 1,
    );
    const item = itemsById.get(itemId);
    const dimensions = item?.pricingMode === "free_amount" ? { thickness: "", width: "", length: "" } : initialDimensions(item?.dimensionDefaults);
    updateLine(key, {
      itemId,
      quantity: "1",
      piecePrice: item && item.pricingMode !== "free_amount" ? String(item.unitPrice) : "",
      ...dimensions,
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
    if (inactiveItemNames.length > 0) {
      return t("validationInactiveItems");
    }
    const filled = snapshotLines.filter((line) => line.itemId);
    if (filled.length === 0) return t("validationLines");

    for (const line of snapshotLines) {
      if (!line.itemId) continue;
      const item = itemsById.get(line.itemId);
      if (!item) return t("validationItem");
      if (item.pricingMode !== "free_amount" && parsePositive(line.quantity) === null) return t("validationItem");
      if (parsePositive(line.piecePrice) === null) return t("validationItem");
      if (item.pricingMode !== "free_amount" &&
        [line.thickness, line.width, line.length].some(
          (value) => value.trim() && parsePositive(value) === null,
        )
      )
        return t("validationOptionalDims");
      if (!isUsableLine({ pricingMode: item.pricingMode, quantity: Number(line.quantity), piecePrice: Number(line.piecePrice), thicknessM: Number(line.thickness), widthM: Number(line.width), lengthM: Number(line.length) })) return t("validationCalculation");
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

    if (!Number.isFinite(snapshotTotals.total) || !Number.isFinite(snapshotPaid) || !Number.isFinite(snapshotDiscount)) return t("validationCalculation");
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
    snapshotAccountPayment: number,
  ): CreateSalesInvoiceInput {
    const payloadLines = snapshotLines
      .filter((line) => line.itemId)
      .map((line) => {
        const item = itemsById.get(line.itemId);
        const freeAmount = item?.pricingMode === "free_amount";
        const base = {
          itemId: line.itemId,
          quantity: freeAmount ? 1 : parsePositive(line.quantity)!,
          piecePrice: roundMoney(parsePositive(line.piecePrice)!),
          note: line.note.trim() || undefined,
          thickness: freeAmount ? undefined : parsePositive(line.thickness) ?? undefined,
          width: freeAmount ? undefined : parsePositive(line.width) ?? undefined,
          length: freeAmount ? undefined : parsePositive(line.length) ?? undefined,
        };
        return base;
      });

    return {
      type,
      customerId: type === "customer_sale" ? customerId! : undefined,
      lines: payloadLines,
      discount: roundMoney(snapshotDiscount),
      paid: roundMoney(snapshotPaid),
      accountPaymentAmount: type === "customer_sale" ? snapshotAccountPayment : undefined,
    };
  }

  async function submit(options: {
    print: boolean;
    t: (key: string) => string;
  }): Promise<string | null> {
    if (isSubmitting) return null;
    if (type === "customer_sale" && parseAccountPayment(paidInput) === null) {
      setSubmitError(options.t("validationCalculation"));
      return null;
    }
    if ([discountInput, ...(type === "customer_sale" ? [paidInput] : [])].some((value) => value.trim() && parseNonNegative(value) === null)) {
      setSubmitError(options.t("validationCalculation"));
      return null;
    }
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
    const snapshotPayment = splitInvoicePayment(snapshotPaid, preview.net);
    const snapshotAccountPayment = type === "customer_sale" ? snapshotPayment.accountPaymentAmount : 0;
    const snapshotTotals = computeInvoiceTotals({
      lineTotals: snapshotLineTotals,
      discount: snapshotDiscount,
      paid: snapshotPayment.paid,
    });

    setLines(snapshotLines);
    setDiscountInput(snapshotDiscountInput);
    setPaidInput(snapshotPaidInput);

    const error = validationError(
      snapshotLines,
      snapshotDiscount,
      snapshotPayment.paid,
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
      if (mode === "edit" && invoiceId) {
        const updated = await updateSalesInvoice(
          invoiceId,
          buildPayload(snapshotLines, snapshotDiscount, snapshotPayment.paid, snapshotAccountPayment),
        );
        return updated.id;
      }
      const created = await createSalesInvoice(
        buildPayload(snapshotLines, snapshotDiscount, snapshotPayment.paid, snapshotAccountPayment),
      );
      return created.id;
    } catch (error: unknown) {
      setSubmitError(
        describeError(error, mode === "edit" ? "Update failed" : "Save failed"),
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  const initializeForEdit = useCallback(
    async (invoice: SalesInvoice, customer?: Customer | null) => {
      setMode("edit");
      setOriginalInvoice(invoice);
      setInvoiceId(invoice.id);
      setInvoiceNumber(invoice.invoiceNumber);
      setOriginalItemIds(invoice.lines.map((line) => line.itemId));
      setType(invoice.type);
      setCustomerId(invoice.customerId);
      setSelectedCustomer(customer ?? null);
      setCustomerQuery("");
      setCustomerResults([]);
      setDiscountInput(String(invoice.discount));
      setPaidInput(String(invoice.paid));
      setSubmitError(null);

      const formLines: InvoiceFormLine[] = invoice.lines.map((line, idx) => ({
        key: `edit-${line.itemId}-${idx}-${Date.now()}`,
        itemId: line.itemId,
        quantity: String(line.quantity),
        piecePrice: String(line.piecePrice),
        thickness: line.thickness != null ? String(line.thickness) : "",
        width: line.width != null ? String(line.width) : "",
        length: line.length != null ? String(line.length) : "",
        note: line.note ?? "",
      }));
      setLines(formLines.length > 0 ? formLines : [newLine()]);

      if (invoice.type === "customer_sale" && invoice.customerId && !customer) {
        try {
          const fetched = await getCustomer(invoice.customerId);
          setSelectedCustomer(fetched);
        } catch {
          // Customer might be deleted or offline
        }
      }
    },
    [],
  );

  const resetForm = useCallback(() => {
    setMode("create");
    setOriginalInvoice(null);
    setInvoiceId(null);
    setInvoiceNumber(null);
    setOriginalItemIds([]);
    setType("customer_sale");
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
    mode,
    isEdit: mode === "edit",
    invoiceId,
    invoiceNumber,
    initializeForEdit,
    inactiveItemNames,
    type,
    setSaleType,
    customerId,
    selectedCustomer,
    allCustomers,
    allCustomersLoading,
    customerQuery,
    setCustomerQuery: handleCustomerQueryChange,
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
    duplicateLine,
    removeLine,
    updateLine,
    selectItem,
    addDimensionDefault,
    lineTotals,
    discountInput,
    setDiscountInput,
    paidInput,
    setPaidInput,
    accountPaymentAmount,
    accountBalance,
    totals,
    isSubmitting,
    submitError,
    submit,
    resetForm,
  };
}
