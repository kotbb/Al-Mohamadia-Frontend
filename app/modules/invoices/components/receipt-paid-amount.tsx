import { invoicePaymentBreakdown } from "@/app/modules/shared/utils/account-payment";
import { formatReceiptMoney } from "../utils/receipt-format";
import { PaymentBreakdown } from "@/app/modules/shared/components/payment-breakdown";

interface ReceiptPaidAmountProps {
  paid: number;
  accountPaymentAmount?: number;
}

/** Customer receipts consistently use Arabic labels and Western digits. */
export function ReceiptPaidAmount({ paid, accountPaymentAmount }: ReceiptPaidAmountProps) {
  const breakdown = invoicePaymentBreakdown(paid, accountPaymentAmount);
  return (
    <>
      <span className="col-start-3 row-start-1 text-end font-bold text-[#111]"><bdi>{formatReceiptMoney(breakdown.totalPaid)}</bdi></span>
      {breakdown.accountPaymentAmount > 0 ? (
        <span className="col-start-2 row-start-1 text-end text-[11px] font-normal">
          <PaymentBreakdown invoicePaid={breakdown.invoicePaid} accountPaymentAmount={breakdown.accountPaymentAmount}
            accountLabel="مديونية سابقة" formatAmount={formatReceiptMoney} />
        </span>
      ) : null}
    </>
  );
}
