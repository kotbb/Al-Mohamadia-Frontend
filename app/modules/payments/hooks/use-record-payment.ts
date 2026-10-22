"use client";

import type { CustomerTarget } from "../types/use-record-payment.types";

import { isMoneyAmount } from "@/app/modules/shared/utils/money-validation";
import { useCallback, useState } from "react";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import { roundMoneyAmount } from "@/app/modules/shared/utils/format-money";
import { recordPayment } from "@/app/modules/payments/services/payments.service";
import type {
  Payment,
  PaymentMethod,
} from "@/app/modules/payments/types/payments.types";

export function useRecordPayment() {
  const describeError = useApiErrorMessage();
  const [isOpen, setIsOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerTarget | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback((target?: CustomerTarget) => {
    if (target) {
      setCustomer(target);
      setAmount(
        target.balance > 0
          ? String(roundMoneyAmount(String(target.balance)) ?? target.balance)
          : "",
      );
    } else {
      setCustomer(null);
      setAmount("");
    }
    setMethod("cash");
    setNotes("");
    setError(null);
    setIsOpen(true);
  }, []);

  const selectCustomer = useCallback((target: CustomerTarget) => {
    setCustomer(target);
    setAmount(
      target.balance > 0
        ? String(roundMoneyAmount(String(target.balance)) ?? target.balance)
        : "",
    );
    setError(null);
  }, []);

  const clearCustomer = useCallback(() => {
    setCustomer(null);
    setAmount("");
    setError(null);
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

      const numAmount = Number(amount);
      if (!amount.trim() || !isMoneyAmount(numAmount) || numAmount <= 0) {
        setError("amountInvalid");
        return null;
      }
      setAmount(String(numAmount));

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
        setError(describeError(err, "recordError"));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [customer, amount, method, notes, describeError],
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
    selectCustomer,
    clearCustomer,
    submit,
  };
}
