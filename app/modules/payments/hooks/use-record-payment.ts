"use client";

import { useCallback, useState } from "react";
import { recordPayment } from "@/app/modules/payments/services/payments.service";
import type { Payment, PaymentMethod } from "@/app/modules/payments/types/payments.types";

interface CustomerTarget {
  id: string;
  name: string;
  balance: number;
}

export function useRecordPayment() {
  const [isOpen, setIsOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerTarget | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback((target: CustomerTarget) => {
    setCustomer(target);
    setAmount(target.balance > 0 ? String(target.balance) : "");
    setMethod("cash");
    setNotes("");
    setError(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
    setCustomer(null);
    setAmount("");
    setNotes("");
    setError(null);
  }, [isSubmitting]);

  const submit = useCallback(
    async (onSuccess?: (payment: Payment) => void): Promise<Payment | null> => {
      if (!customer) return null;

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError("amountInvalid");
        return null;
      }

      if (numAmount > customer.balance) {
        setError("amountExceedsBalance");
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const payment = await recordPayment({
          customerId: customer.id,
          amount: numAmount,
          method,
          notes: notes.trim() ? notes.trim() : undefined,
        });
        setIsOpen(false);
        setCustomer(null);
        onSuccess?.(payment);
        return payment;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "recordError";
        setError(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [customer, amount, method, notes],
  );

  return {
    isOpen,
    customer,
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
    submit,
  };
}
