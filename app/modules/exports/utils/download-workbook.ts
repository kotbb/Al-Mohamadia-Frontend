import type { ExportLocale } from "../types/exports.types";

export function saveExportWorkbook(blob: Blob, locale: ExportLocale) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `al-mohamadia-export-${locale}.xlsx`;
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    // Allow the browser to begin consuming the object URL before revoking it.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
