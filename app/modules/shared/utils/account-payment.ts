import { roundMoney } from "./invoice-math";
import { isMoneyAmount } from "./money-validation";

/** Blank means no additional payment. Never silently round entered account money. */
export function parseAccountPayment(raw: string): number | null {
  if (!raw.trim()) return 0;
  const amount = Number(raw);
  if (!isMoneyAmount(amount)) return null;
  return roundMoney(amount);
}

/** Keep invoice settlement capped; the rest pays the account independently. */
export function splitInvoicePayment(enteredPaid: number, invoiceNet: number) {
  const net = Math.max(0, roundMoney(invoiceNet));
  const entered = roundMoney(enteredPaid);
  const paid = Math.min(entered, net);
  return {
    paid,
    accountPaymentAmount: roundMoney(Math.max(0, entered - net)),
    remaining: roundMoney(Math.max(0, net - paid)),
  };
}

export function invoicePaymentBreakdown(paid: number, accountPaymentAmount = 0) {
  const invoicePaid = roundMoney(paid);
  const additional = Number.isFinite(accountPaymentAmount) ? roundMoney(Math.max(0, accountPaymentAmount)) : 0;
  return { invoicePaid, accountPaymentAmount: additional, totalPaid: roundMoney(invoicePaid + additional) };
}

export function accountBalanceAfterInvoice(
  currentBalance: number,
  invoiceRemaining: number,
  accountPaymentAmount: number,
  previousInvoiceRemaining = 0,
): number {
  return roundMoney(currentBalance - previousInvoiceRemaining + invoiceRemaining - accountPaymentAmount);
}
