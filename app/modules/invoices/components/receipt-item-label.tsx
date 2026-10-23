import { formatReceiptItemLabel } from "../utils/receipt-format";

interface ReceiptItemLabelProps {
  label: string;
  className?: string;
}

export function ReceiptItemLabel({ label, className }: ReceiptItemLabelProps) {
  const parts = formatReceiptItemLabel(label).split(/([0-9]+(?:[.,][0-9]+)*)/g);

  return (
    <div dir="rtl" className={`whitespace-normal break-words ${className ?? ""}`}>
      {parts.map((part, index) =>
        /^[0-9]+(?:[.,][0-9]+)*$/.test(part) ? (
          <bdi key={index} dir="ltr" className="inline-block whitespace-nowrap align-baseline">{part}</bdi>
        ) : part,
      )}
    </div>
  );
}
