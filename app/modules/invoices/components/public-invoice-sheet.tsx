import { receiptUnitPrice } from "../utils/receipt-unit-price";
import Image from "next/image";
import type { Ref } from "react";
import type { PublicInvoice } from "../types/invoices.types";
import { ReceiptItemLabel } from "./receipt-item-label";
import {
  formatReceiptCubicVolume,
  receiptLineCubicVolume,
  receiptTotalCubicVolume,
} from "../utils/receipt-volume";
import {
  formatReceiptDateTime,
  formatReceiptMoney as money,
  receiptDisplayNumber,
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
  const hasCubic = invoice.lines.some((line) => receiptLineCubicVolume(line) !== null);
  const cellPadding = compact ? "px-[11px]" : "px-3";
  const headerPadding = compact ? "px-1.5" : "px-2";
  const headerHeight = compact ? "h-8" : "h-9";
  const headerText = compact ? "text-[10px]" : "text-xs";
  const itemWidth = hasCubic ? compact ? "w-[17%]" : "w-[22%]" : "";
  const dimensionWidth = hasCubic
    ? compact ? "w-[10%]" : "w-[9%]"
    : compact ? "w-[12%]" : "w-[11%]";
  const unitPriceWidth = hasCubic ? "w-[14%]" : "w-[16%]";
  const lineTotalWidth = hasCubic
    ? "w-[16%]"
    : compact ? "w-[19%]" : "w-[18%]";
  return (
    <div
      ref={printAreaRef}
      id={id}
      dir="rtl"
      className={`invoice-receipt bg-white text-[#1a1a1a] shadow-xl print:shadow-none ${compact ? "text-[11px]" : ""}`}
      style={{ padding: compact ? "3mm" : "12mm", direction: "rtl" }}
    >
      {/* Header */}
      <div
        className={`${compact ? "mb-3" : "mb-5"} flex items-center justify-between gap-4`}
      >
        {/* Right: Invoice # & Date */}
        <div className="text-right">
          <div
            className={`${compact ? "text-base" : "text-xl"} font-bold leading-tight text-[#b85d19]`}
          >
            فاتورة #{receiptDisplayNumber(invoice.invoiceNumber)}
          </div>
          <div className={`mt-1 text-[#666] ${compact ? "text-[10px]" : "text-[11px]"}`}>
            {formatReceiptDateTime(invoice.createdAt)}
          </div>
        </div>

        {/* Left: Brand */}
        <div className="flex flex-col items-center" dir="rtl">
          <div className="flex items-center gap-2.5">
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
            <span
              dir="rtl"
              className="text-[22px] font-bold text-[#1a1a1a] leading-tight"
              style={{ letterSpacing: "0px" }}
            >
              المحمدية
            </span>
          </div>
          <span
            dir="rtl"
            className="mt-0.5 text-center text-[11px] text-[#777]"
            style={{ letterSpacing: "0px" }}
          >
            لتجارة الأخشاب والألواح
          </span>
        </div>
      </div>

      {/* Thick rule */}
      <hr
        className={`${compact ? "mb-2.5" : "mb-3.5"} border-0 border-t-2 border-[#222]`}
      />

      {/* Customer */}
      <div
        className={`${compact ? "mb-2.5 text-xs" : "mb-4 text-sm"} flex items-center gap-2`}
      >
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
      <table
        dir="rtl"
        className={`${compact ? "mb-3 text-[10px]" : "mb-5 text-xs"} w-full table-fixed border-collapse`}
      >
        <thead>
          <tr className="bg-receipt-header text-white">
            <th
              className={`${headerPadding} ${headerText} ${itemWidth} text-right align-middle font-semibold`}
            >
              <span className={`receipt-header-label ${headerHeight} flex items-center justify-start whitespace-nowrap leading-none`}>الصنف</span>
            </th>
            <th className={`w-[9%] ${headerPadding} ${headerText} text-center align-middle font-semibold`}>
              <span className={`receipt-header-label ${headerHeight} flex items-center justify-center whitespace-nowrap leading-none`}>العدد</span>
            </th>
            {hasDimensions && (
              <>
                <th className={`${dimensionWidth} ${headerPadding} ${headerText} text-center align-middle font-semibold`}>
                  <span className={`receipt-header-label ${headerHeight} flex items-center justify-center whitespace-nowrap leading-none`}>التخانة</span>
                </th>
                <th className={`${dimensionWidth} ${headerPadding} ${headerText} text-center align-middle font-semibold`}>
                  <span className={`receipt-header-label ${headerHeight} flex items-center justify-center whitespace-nowrap leading-none`}>العرض</span>
                </th>
                <th className={`${dimensionWidth} ${headerPadding} ${headerText} text-center align-middle font-semibold`}>
                  <span className={`receipt-header-label ${headerHeight} flex items-center justify-center whitespace-nowrap leading-none`}>الطول</span>
                </th>
              </>
            )}
            {hasCubic && (
              <th className={`${compact ? "w-[14%]" : "w-[12%]"} ${headerPadding} ${headerText} text-center align-middle font-semibold`}>
                <span className={`receipt-header-label ${headerHeight} flex items-center justify-center whitespace-nowrap leading-none`}>المكعب</span>
              </th>
            )}
            {showPrices && (
              <>
                <th className={`${unitPriceWidth} ${headerPadding} ${headerText} text-center align-middle font-semibold`}>
                  <span className={`receipt-header-label ${headerHeight} flex items-center justify-center whitespace-nowrap leading-none`}>سعر الوحدة</span>
                </th>
                <th className={`${lineTotalWidth} ${headerPadding} ${headerText} text-center align-middle font-semibold`}>
                  <span className={`receipt-header-label ${headerHeight} flex items-center justify-center whitespace-nowrap leading-none`}>الإجمالي</span>
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, idx) => {
            const cubicVolume = receiptLineCubicVolume(line);
            return (
              <tr
                key={idx}
                className={`border-b border-[#e0e0e0] ${compact ? "text-[10px]" : "text-[12px]"}`}
              >
                <td
                  className={`${compact ? "py-1.5" : "py-2.5"} ${cellPadding} text-right align-top`}
                >
                  <ReceiptItemLabel
                    label={line.itemLabel}
                    className={`${compact ? "text-[11px]" : "text-[13px]"} font-bold text-[#111]`}
                  />
                  {line.note && (
                    <div className="mt-0.5 text-[10px] italic text-[#666]">
                      {line.note}
                    </div>
                  )}
                </td>
                <td className={`${compact ? "py-1.5" : "py-2.5"} ${cellPadding} text-center align-top font-bold text-[#1a1a1a]`}>
                  {line.quantity}
                </td>
                {hasDimensions && (
                  <>
                    <td
                      className={`${compact ? "py-1.5" : "py-2.5"} ${cellPadding} text-center align-top text-[#1a1a1a]`}
                    >
                      {line.thickness ?? "—"}
                    </td>
                    <td
                      className={`${compact ? "py-1.5" : "py-2.5"} ${cellPadding} text-center align-top text-[#1a1a1a]`}
                    >
                      {line.width ?? "—"}
                    </td>
                    <td
                      className={`${compact ? "py-1.5" : "py-2.5"} ${cellPadding} text-center align-top text-[#1a1a1a]`}
                    >
                      {line.length ?? "—"}
                    </td>
                  </>
                )}
                {hasCubic && (
                  <td className={`${compact ? "py-1.5" : "py-2.5"} ${cellPadding} receipt-volume-cell text-center align-top text-[#1a1a1a]`}>
                    {cubicVolume === null ? "" : formatReceiptCubicVolume(cubicVolume)}
                  </td>
                )}
                {showPrices && (
                  <>
                    <td
                      className={`${cellPadding} text-center align-top text-[#1a1a1a] ${compact ? "py-1.5" : "py-2.5"}`}
                    >
                      {money(receiptUnitPrice(line))}
                    </td>
                    <td
                      className={`${cellPadding} text-center align-top font-bold text-[#1a1a1a] ${compact ? "py-1.5" : "py-2.5"}`}
                    >
                      {money(line.lineTotal)}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {hasCubic && (
            <tr className="border-t-2 border-[#222] font-bold text-[#111]">
              <td className={`${cellPadding} py-2 text-right`}>إجمالي المكعب</td>
              <td colSpan={hasDimensions ? 4 : 1} />
              <td className={`${cellPadding} py-2 text-center`}>
                {formatReceiptCubicVolume(receiptTotalCubicVolume(invoice.lines))}
              </td>
              {showPrices && <td colSpan={2} />}
            </tr>
          )}
          <tr className={`${hasCubic ? "" : "border-t-2 border-[#222]"} font-bold text-[#111]`}>
            <td
              className={`${cellPadding} py-2 text-right`}
            >
              الإجمالي
            </td>
            <td className={`${cellPadding} py-2 text-center`}>
              {invoice.lines.reduce((sum, line) => sum + line.quantity, 0)}
            </td>
            {hasDimensions && <td colSpan={3} />}
            {hasCubic && <td className={`${cellPadding} py-2`} />}
            {showPrices && (
              <>
                <td className={`${cellPadding} py-2`} />
                <td dir="ltr" className={`${cellPadding} py-2 text-center`}>
                  {money(invoice.total)}
                </td>
              </>
            )}
          </tr>
        </tfoot>
      </table>

      {/* Totals */}
      {showPrices && (
        <div className={`${compact ? "mt-2" : "mt-4"} flex justify-start`}>
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
        </div>
      )}
    </div>
  );
}
