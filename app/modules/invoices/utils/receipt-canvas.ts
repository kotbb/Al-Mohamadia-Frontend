export function prepareReceiptCanvasClone(document: Document, sheetId: string): void {
  // html2pdf adds another copy of the receipt before html2canvas clones the page.
  // Update every matching sheet in that cloned page so the captured copy is included.
  document.querySelectorAll<HTMLElement>("[id]").forEach((sheet) => {
    if (sheet.id !== sheetId) return;
    sheet.dir = "rtl";
    sheet.style.direction = "rtl";

    sheet.querySelectorAll<HTMLElement>(".receipt-header-label").forEach((label) => {
      label.style.position = "relative";
      label.style.top = "-7px";
    });
  });
}
