"use client";

import { useCallback, useState } from "react";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import { roundMoneyAmount } from "@/app/modules/items/utils/format-money";
import { recordSupplierPayment } from "@/app/modules/supplier-payments/services/supplier-payments.service";
import type {
  SupplierPayment,
  PaymentMethod,
} from "@/app/modules/supplier-payments/types/supplier-payments.types";

export interface SupplierTarget {
  id: string;
  name: string;
  amountOwed: number;
  phone?: string | null;
}

export function useRecordSupplierPayment() {
  const describeError = useApiErrorMessage();
  const [isOpen, setIsOpen] = useState(false);
  const [supplier, setSupplier] = useState<SupplierTarget | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback((target?: SupplierTarget) => {
    if (target) {
      setSupplier(target);
      setAmount(
        target.amountOwed > 0
          ? String(roundMoneyAmount(String(target.amountOwed)) ?? target.amountOwed)
          : "",
      );
    } else {
      setSupplier(null);
      setAmount("");
    }
    setMethod("cash");
    setNotes("");
    setError(null);
    setIsOpen(true);
  }, []);

  const selectSupplier = useCallback((target: SupplierTarget) => {
    setSupplier(target);
    setAmount(
      target.amountOwed > 0
        ? String(roundMoneyAmount(String(target.amountOwed)) ?? target.amountOwed)
        : "",
    );
    setError(null);
  }, []);

  const clearSupplier = useCallback(() => {
    setSupplier(null);
    setAmount("");
    setError(null);
  }, []);

  const close = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
    setSupplier(null);
    setAmount("");
    setNotes("");
    setError(null);
  }, [isSubmitting]);

  const submit = useCallback(
    async (
      onSuccess?: (payment: SupplierPayment) => void,
    ): Promise<SupplierPayment | null> => {
      if (!supplier) return null;

      const numAmount = roundMoneyAmount(amount);
      if (numAmount === null || numAmount <= 0) {
        setError("amountInvalid");
        return null;
      }
      setAmount(String(numAmount));

      if (numAmount > supplier.amountOwed) {
        setError("amountExceedsDebt");
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const payment = await recordSupplierPayment({
          supplierId: supplier.id,
          amount: numAmount,
          method,
          notes: notes.trim() ? notes.trim() : undefined,
        });
        setIsOpen(false);
        setSupplier(null);
        onSuccess?.(payment);
        return payment;
      } catch (err: unknown) {
        setError(describeError(err, "recordError"));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [supplier, amount, method, notes, describeError],
  );

  return {
    isOpen,
    supplier,
    amount,
    setAmount,
    method,
    setMethod,
    notes,
    setNotes,
    isSubmitting,
    error,
    setError,
    open,
    close,
    selectSupplier,
    clearSupplier,
    submit,
  };
}
