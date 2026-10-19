export function formatDateYMD(iso: string | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export function formatReceiptDateTime(iso: string | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US-u-nu-latn", {
      timeZone: "Africa/Cairo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute} ${parts.dayPeriod === "AM" ? "ص" : "م"}`;
}

export function receiptDisplayNumber(invoiceNumber: string): string {
  return invoiceNumber.replace(/^INV-/, "");
}

export function formatReceiptItemLabel(label: string): string {
  return label.replace(/([0-9])(?=\p{Script=Arabic})/gu, "$1 ");
}

export function formatReceiptMoney(value: number): string {
  const amount = value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
  return `${amount}`;
}
