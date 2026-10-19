import { receiptDisplayNumber } from "./receipt-format";
import { prepareReceiptCanvasClone } from "./receipt-canvas";

export async function downloadInvoicePdf(
  elementId: string,
  invoiceNumber: string,
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  const element = document.getElementById(elementId);
  if (!element) return;
  await html2pdf()
    .set({
      margin: 0,
      filename: `فاتورة-${receiptDisplayNumber(invoiceNumber)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (document: Document) => prepareReceiptCanvasClone(document, elementId),
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
}
