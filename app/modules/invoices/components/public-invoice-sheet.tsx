import Image from "next/image";
import type { Ref } from "react";
import type { PublicInvoice } from "../types/invoices.types";
import {
  formatDateYMD,
  formatReceiptMoney as money,
} from "../utils/receipt-format";

interface PublicInvoiceSheetProps {
  invoice: PublicInvoice;
  printAreaRef?: Ref<HTMLDivElement>;
  showPrices?: boolean;
  id?: string;
  compact?: boolean;
}

export function PublicInvoiceSheet({
  invoice,
  printAreaRef,
  showPrices = true,
  id = "public-invoice-sheet",
  compact = false,
}: PublicInvoiceSheetProps) {
  const hasDimensions = invoice?.lines.some(
    (l) => l.thickness != null || l.width != null || l.length != null,
  );
  return (
    <div
      ref={printAreaRef}
      id={id}
      dir="rtl"
      className={`bg-white text-[#1a1a1a] shadow-xl print:shadow-none ${compact ? "text-[11px]" : ""}`}
      style={{ padding: compact ? "9mm" : "16mm", direction: "rtl" }}
    >
      {/* Header */}
      <div className={`${compact ? "mb-3" : "mb-5"} flex items-center justify-between gap-4`}>
        {/* Right: Invoice # & Date */}
        <div className="text-right">
          <div className={`${compact ? "text-base" : "text-xl"} font-bold leading-tight text-[#b85d19]`}>
            فاتورة #{invoice.invoiceNumber}
          </div>
          <div className="mt-1 text-xs text-[#666]">
            {formatDateYMD(invoice.createdAt)}
          </div>
        </div>

        {/* Left: Brand */}
        <div className="flex items-center gap-2.5" dir="rtl">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white">
            <Image
              src="/images/icon-mark.png"
              alt="Logo"
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col text-right" dir="rtl">
            <span
              dir="rtl"
              className="text-[22px] font-bold text-[#1a1a1a] leading-tight"
              style={{ letterSpacing: "0px" }}
            >
              المحمدية
            </span>
            <span
              dir="rtl"
              className="mt-0.5 text-[11px] text-[#777]"
              style={{ letterSpacing: "0px" }}
            >
              تجارة الأخشاب والألواح
            </span>
          </div>
        </div>
      </div>

      {/* Thick rule */}
      <hr className={`${compact ? "mb-2.5" : "mb-3.5"} border-0 border-t-2 border-[#222]`} />

      {/* Customer */}
      <div className={`${compact ? "mb-2.5 text-xs" : "mb-4 text-sm"} flex items-center gap-2`}>
        <span className="font-bold text-[#444]">العميل:</span>
        <span className="font-bold text-[#111]">
          {invoice.type === "cash_sale"
            ? "نقدي"
            : (invoice.customerName ?? "—")}
        </span>
      </div>

      {/* Status banner for cancelled invoices */}
      {invoice.status === "cancelled" && (
        <div className="mb-4 rounded-md bg-[#fee2e2] p-2 text-center text-[15px] font-bold text-[#b91c1c]">
          فاتورة ملغاة
        </div>
      )}

      {/* Items table */}
      <table dir="rtl" className={`${compact ? "mb-3 text-[10px]" : "mb-5 text-xs"} w-full table-fixed border-collapse`}>
        <thead>
          <tr className="border-b-[1.5px] border-[#222] text-[#333]">
            <th className={`${compact ? "py-1.5 text-[10px]" : "py-2 text-[13px]"} px-1.5 text-right font-bold`}>
              الصنف
            </th>
            {hasDimensions && (
              <>
                <th className="w-[10%] py-2 px-1.5 text-center text-[13px] font-bold">
                  التخانة (م)
                </th>
                <th className="w-[10%] py-2 px-1.5 text-center text-[13px] font-bold">
                  العرض (م)
                </th>
                <th className="w-[10%] py-2 px-1.5 text-center text-[13px] font-bold">
                  الطول (م)
                </th>
              </>
            )}
            <th className="w-[11%] py-2 px-1.5 text-center text-[13px] font-bold">
              العدد
            </th>
            {showPrices && <><th className="w-[15%] py-2 px-1.5 text-center text-[13px] font-bold">سعر الوحدة</th><th className="w-[16%] py-2 px-1.5 text-center text-[13px] font-bold">الإجمالي</th></>}
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, idx) => (
            <tr key={idx} className={`border-b border-[#e0e0e0] ${compact ? "text-[10px]" : "text-[12px]"}`}>
              <td className={`${compact ? "py-1.5" : "py-2.5"} px-1.5 text-right align-top`}>
                <div className={`${compact ? "text-[11px]" : "text-[13px]"} font-bold text-[#111]`}>
                  {line.itemLabel}
                </div>
                {line.note && (
                  <div className="mt-0.5 text-[10px] italic text-[#666]">
                    {line.note}
                  </div>
                )}
              </td>
              {hasDimensions && (
                <>
                  <td className={`${compact ? "py-1.5" : "py-2.5"} px-1.5 text-center align-top text-[#1a1a1a]`}>
                    {line.thickness ?? "—"}
                  </td>
                  <td className={`${compact ? "py-1.5" : "py-2.5"} px-1.5 text-center align-top text-[#1a1a1a]`}>
                    {line.width ?? "—"}
                  </td>
                  <td className={`${compact ? "py-1.5" : "py-2.5"} px-1.5 text-center align-top text-[#1a1a1a]`}>
                    {line.length ?? "—"}
                  </td>
                </>
              )}
              <td className={`${compact ? "py-1.5" : "py-2.5"} px-1.5 text-center align-top font-bold text-[#1a1a1a]`}>
                {line.quantity}
              </td>
              {showPrices && <><td className={`whitespace-nowrap px-1.5 text-center align-top text-[#1a1a1a] ${compact ? "py-1.5" : "py-2.5"}`}>{money(line.piecePrice)}</td><td className={`whitespace-nowrap px-1.5 text-center align-top font-bold text-[#1a1a1a] ${compact ? "py-1.5" : "py-2.5"}`}>{money(line.lineTotal)}</td></>}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[#222] font-bold text-[#111]">
            <td colSpan={hasDimensions ? 4 : 1} className="px-1.5 py-2 text-right">الإجمالي</td>
            <td className="px-1.5 py-2 text-center">{invoice.lines.reduce((sum, line) => sum + line.quantity, 0)}</td>
            {showPrices && <><td className="px-1.5 py-2" /><td dir="ltr" className="px-1.5 py-2 text-center">{money(invoice.total)}</td></>}
          </tr>
        </tfoot>
      </table>

      {/* Totals */}
      {showPrices && <div className={`${compact ? "mt-2" : "mt-4"} flex justify-end`}>
        <div className="w-[240px]">
          <div className="mb-2 flex items-baseline justify-between gap-4 text-[13px]">
            <span className="font-bold text-[#555]">المطلوب:</span>
            <span className="whitespace-nowrap font-bold text-[#111]">
              {money(invoice.total)}
            </span>
          </div>
          {invoice.discount > 0 && (
            <div className="mb-2 flex items-baseline justify-between gap-4 text-[13px]">
              <span className="font-bold text-[#555]">الخصم:</span>
              <span className="whitespace-nowrap font-bold text-[#111]">
                {money(invoice.discount)}
              </span>
            </div>
          )}
          <div className="mb-2 flex items-baseline justify-between gap-4 text-[13px]">
            <span className="font-bold text-[#555]">المدفوع:</span>
            <span className="whitespace-nowrap font-bold text-[#111]">
              {money(invoice.paid)}
            </span>
          </div>
          <hr className="my-1.5 mb-2.5 border-0 border-t-[1.5px] border-[#222]" />
          <div className="flex items-baseline justify-between gap-4 text-[16px] font-bold">
            <span className="text-[#111]">المتبقي:</span>
            <span className="whitespace-nowrap text-[17px] text-[#b85d19]">
              {money(invoice.remaining)}
            </span>
          </div>
        </div>
      </div>}
    </div>
  );
}
