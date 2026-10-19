import { receiptDisplayNumber } from "./receipt-format";
import { prepareReceiptCanvasClone } from "./receipt-canvas";

export type InvoiceFileFormat = "pdf" | "png";

export async function createInvoiceFile(
  element: HTMLElement,
  invoiceNumber: string,
  format: InvoiceFileFormat,
): Promise<File> {
  await Promise.all(Array.from(element.querySelectorAll("img")).map((image) => image.decode().catch(() => undefined)));
  const html2pdf = (await import("html2pdf.js")).default;
  const filename = `فاتورة-${receiptDisplayNumber(invoiceNumber)}.${format}`;
  const worker = html2pdf().set({
    margin: 0,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (document: Document) => prepareReceiptCanvasClone(document, element.id),
    },
    jsPDF: { unit: "mm", format: format === "pdf" ? "a4" : "a5", orientation: "portrait" },
  }).from(element);

  if (format === "pdf") {
    const blob = (await worker.outputPdf("blob")) as Blob;
    return new File([blob], filename, { type: "application/pdf" });
  }

  const canvas = (await worker.toCanvas().get("canvas")) as HTMLCanvasElement;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image export failed")), "image/png");
  });
  return new File([blob], filename, { type: "image/png" });
}

export function downloadInvoiceFile(file: File): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
