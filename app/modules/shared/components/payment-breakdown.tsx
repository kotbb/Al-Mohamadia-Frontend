interface PaymentBreakdownProps {
  invoicePaid: number;
  accountPaymentAmount: number;
  accountLabel: string;
  formatAmount: (amount: number) => string;
}

/** Isolate the equation and keep the account amount bound to its label in RTL. */
export function PaymentBreakdown({ invoicePaid, accountPaymentAmount, accountLabel, formatAmount }: PaymentBreakdownProps) {
  return (
    <bdi dir="ltr" className="payment-breakdown inline-flex flex-wrap items-baseline gap-x-1">
      <span>(</span><bdi>{formatAmount(invoicePaid)}</bdi><span>+</span>
      <span className="payment-account-portion inline-flex items-baseline gap-x-1 whitespace-nowrap">
        <bdi>{formatAmount(accountPaymentAmount)}</bdi><bdi>{accountLabel}</bdi>
      </span><span>)</span>
    </bdi>
  );
}
