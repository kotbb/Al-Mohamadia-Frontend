import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
const overrides = new Map();

function receiptHeadings(html) {
  return [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)]
    .map((match) => match[1].replace(/<[^>]+>/g, "").trim());
}

test("invoice neighbor requests hide old results and ignore late responses or failures after switching", async () => {
  const states = [];
  let cursor = 0;
  let previousDependencies;
  let cleanup;
  const effects = [];
  const requests = [];
  overrides.set("react", {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [
        states[index],
        (next) => {
          states[index] =
            typeof next === "function" ? next(states[index]) : next;
        },
      ];
    },
    useEffect(effect, dependencies) {
      if (
        !previousDependencies ||
        dependencies.some(
          (value, index) => previousDependencies[index] !== value,
        )
      ) {
        cleanup?.();
        effects.push(() => {
          cleanup = effect();
        });
        previousDependencies = dependencies;
      }
    },
  });
  overrides.set("../services/invoices.service", {
    getInvoiceNeighbors(id, signal) {
      return new Promise((resolve, reject) =>
        requests.push({ id, signal, resolve, reject }),
      );
    },
  });
  try {
    const { useInvoiceNeighbors } = load(
      "@/app/modules/invoices/hooks/use-invoice-neighbors",
    );
    function render(id) {
      cursor = 0;
      // This test invokes the hook through a minimal React hook harness.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const value = useInvoiceNeighbors(id);
      while (effects.length) effects.shift()();
      return value;
    }
    const dataA = {
      previousId: "a",
      nextId: null,
      previousByNumberId: "one",
      nextByNumberId: "two",
    };
    render("A");
    render("B");
    assert.equal(requests[0].signal.aborted, true);
    requests[0].resolve(dataA);
    await Promise.resolve();
    assert.equal(render("B").neighbors, null);
    requests[1].resolve({ ...dataA, previousByNumberId: "three" });
    await Promise.resolve();
    assert.equal(render("B").neighbors.previousByNumberId, "three");
    assert.equal(render("C").neighbors, null);
    requests[2].reject(new Error("network"));
    await Promise.resolve();
    await Promise.resolve();
    const failed = render("C");
    assert.equal(failed.failed, true);
    failed.retry();
    assert.equal(render("C").failed, false);
    assert.equal(requests.length, 4);
    render("D");
    requests[3].reject(new Error("late failure"));
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(render("D").failed, false);
  } finally {
    cleanup?.();
    overrides.delete("react");
    overrides.delete("../services/invoices.service");
  }
});

test("row navigation ignores nested actions, modifiers, selections, and disabled results", () => {
  const { canNavigateRow } = load("@/app/modules/shared/utils/row-navigation");
  const click = {
    button: 0,
    modified: false,
    defaultPrevented: false,
    interactiveTarget: false,
    textSelected: false,
  };
  assert.equal(canNavigateRow(click), true);
  for (const patch of [
    { disabled: true },
    { button: 1 },
    { modified: true },
    { defaultPrevented: true },
    { interactiveTarget: true },
    { textSelected: true },
  ]) {
    assert.equal(canNavigateRow({ ...click, ...patch }), false);
  }
});

test("calendar dates stay on the stored day in both locales and reject invalid dates", () => {
  const { formatCalendarDate } = load(
    "@/app/modules/shared/utils/format-calendar-date",
  );
  assert.equal(formatCalendarDate("2026-12-31", "en"), "Dec 31, 2026");
  assert.equal(formatCalendarDate("2024-02-29", "en"), "Feb 29, 2024");
  assert.match(formatCalendarDate("2026-01-01", "ar"), /2026/);
  assert.match(formatCalendarDate("2026-01-01", "ar"), /1/);
  for (const date of [
    undefined,
    "",
    "2026-02-29",
    "2026-13-01",
    "2026-01-01T00:00:00Z",
  ])
    assert.equal(formatCalendarDate(date, "en"), "—");
});

test("receipt unit price uses saved cubic mode and rounded volume without changing line totals", () => {
  const { receiptUnitPrice } = load(
    "@/app/modules/invoices/utils/receipt-unit-price",
  );
  const line = {
    thickness: 0.19,
    width: 0.125,
    length: 0.36,
    piecePrice: 23000,
    pricingModeSnapshot: "per_cubic_meter",
    quantity: 3,
    lineTotal: 589.95,
  };
  assert.equal(receiptUnitPrice(line), 196.65);
  assert.equal(
    receiptUnitPrice({ ...line, pricingModeSnapshot: "per_piece" }),
    23000,
  );
  assert.equal(
    receiptUnitPrice({ ...line, pricingModeSnapshot: undefined }),
    196.65,
  );
  assert.equal(
    receiptUnitPrice({
      ...line,
      pricingModeSnapshot: undefined,
      thickness: null,
    }),
    23000,
  );
  assert.equal(
    receiptUnitPrice({
      ...line,
      thickness: 0.3333333,
      width: 1,
      length: 1,
      piecePrice: 10,
    }),
    3.33333,
  );
  assert.equal(line.lineTotal, 589.95);
  assert.equal(line.piecePrice, 23000);
});
function load(modulePath, parent = root) {
  let file = modulePath.startsWith("@/")
    ? resolve(root, modulePath.slice(2))
    : resolve(parent, modulePath);
  if (!existsSync(file)) file += existsSync(`${file}.ts`) ? ".ts" : ".tsx";
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const output = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const require = (dependency) =>
    overrides.has(dependency)
      ? overrides.get(dependency)
      : dependency.startsWith("@/") || dependency.startsWith(".")
        ? load(dependency, dirname(file))
        : nativeRequire(dependency);
  new Function("require", "exports", output)(require, exports);
  return exports;
}

const sales = load("@/app/modules/invoices/utils/invoice-form");
const purchases = load("@/app/modules/purchases/utils/purchase-form");
const math = load("@/app/modules/shared/utils/invoice-math");
const defaults = load("@/app/modules/items/utils/dimension-defaults");
const receipt = load("@/app/modules/invoices/utils/receipt-format");
const piece = { id: "piece", pricingMode: "per_piece" };
const cubic = { id: "cubic", pricingMode: "per_cubic_meter" };
const items = new Map([
  [piece.id, piece],
  [cubic.id, cubic],
]);

test("sales and purchases keep piece totals independent of descriptive dimensions", () => {
  assert.equal(
    sales.lineTotalForFormLine(
      {
        ...sales.newLine(),
        itemId: "piece",
        quantity: "2",
        piecePrice: "450",
        thickness: "0.018",
        width: "1.22",
        length: "2.44",
      },
      items,
    ),
    900,
  );
  assert.equal(
    purchases.lineTotalForPurchaseLine(
      {
        ...purchases.newLine(),
        itemId: "piece",
        quantity: "2",
        unitCost: "350",
        thicknessM: "0.018",
        widthM: "1.22",
        lengthM: "2.44",
      },
      items,
    ),
    700,
  );
});
test("cubic previews require dimensions and use meter volume", () => {
  const sale = {
    ...sales.newLine(),
    itemId: "cubic",
    quantity: "5",
    piecePrice: "8000",
    thickness: "0.05",
    width: "0.1",
    length: "4",
  };
  assert.equal(sales.lineTotalForFormLine(sale, items), 800);
  assert.equal(sales.lineTotalForFormLine({ ...sale, width: "" }, items), 0);
  assert.equal(
    purchases.lineTotalForPurchaseLine(
      {
        ...purchases.newLine(),
        itemId: "cubic",
        quantity: "5",
        unitCost: "8000",
        thicknessM: "0.05",
        widthM: "0.1",
        lengthM: "4",
      },
      items,
    ),
    800,
  );
});
test("invoice totals retain discount/paid rounding and remaining calculation", () => {
  assert.deepEqual(
    math.computeInvoiceTotals({
      lineTotals: [900, 800],
      discount: 100,
      paid: 500,
    }),
    { total: 1700, discount: 100, paid: 500, net: 1600, remaining: 1100 },
  );
});
test("presets still auto-fill only single values, reset blanks and normalize custom values", () => {
  assert.deepEqual(
    defaults.initialDimensions({
      thickness: [0.018],
      width: [1.22, 1.5],
      length: [],
    }),
    { thickness: "0.018", width: "", length: "" },
  );
  assert.deepEqual(defaults.initialDimensions(), {
    thickness: "",
    width: "",
    length: "",
  });
  assert.deepEqual(
    defaults.parseDimensionDefaults({
      thickness: ["0.025", "0.018", "0.018"],
      width: ["1.37"],
      length: [""],
    }),
    { thickness: [0.018, 0.025], width: [1.37], length: [] },
  );
  assert.equal(
    defaults.parseDimensionDefaults({
      thickness: ["0"],
      width: [],
      length: [],
    }),
    null,
  );
});
test("receipt date and money formatting preserve both receipt displays", () => {
  assert.equal(receipt.formatDateYMD(undefined), "-");
  assert.equal(receipt.formatDateYMD("invalid"), "-");
  assert.equal(receipt.formatDateYMD("2026-10-14T12:00:00"), "2026/10/14");
  assert.equal(receipt.formatReceiptMoney(1700), "1,700");
  assert.equal(receipt.formatReceiptMoney(10.5), "10.50");
});
test("customer receipts use Cairo time and a number without the sales prefix", () => {
  assert.equal(receipt.formatReceiptDateTime("2026-10-15T14:33:00.000Z"), "2026/10/15 05:33 م");
  assert.equal(receipt.formatReceiptDateTime("invalid"), "-");
  assert.equal(receipt.receiptDisplayNumber("INV-0001"), "0001");
  assert.equal(receipt.receiptDisplayNumber("PUR-0001"), "PUR-0001");
});
test("receipt item names separate Western digits from adjacent Arabic and isolate digit runs", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  assert.equal(receipt.formatReceiptItemLabel("14ملي مربع"), "14 ملي مربع");
  assert.equal(receipt.formatReceiptItemLabel("14 ملي مربع"), "14 ملي مربع");
  assert.equal(receipt.formatReceiptItemLabel("MDF18"), "MDF18");
  const { ReceiptItemLabel } = load("@/app/modules/invoices/components/receipt-item-label");
  const html = renderToStaticMarkup(React.createElement(ReceiptItemLabel, { label: "14ملي مربع" }));
  assert.match(html, /<bdi dir="ltr">14<\/bdi> ملي مربع/);
});
test("receipt cubic volume uses saved mode and six-decimal math before five-decimal display", () => {
  const volume = load("@/app/modules/invoices/utils/receipt-volume");
  const cubic = { pricingModeSnapshot: "per_cubic_meter", quantity: 2, thickness: 0.25, width: 0.15, length: 0.6 };
  const piece = { ...cubic, pricingModeSnapshot: "per_piece" };
  const tiny = { ...cubic, quantity: 1, thickness: 0.001, width: 0.001, length: 1 };
  assert.equal(volume.receiptLineCubicVolume(cubic), 0.045);
  assert.equal(volume.receiptLineCubicVolume(piece), null);
  assert.equal(volume.receiptLineCubicVolume(tiny), 0.000001);
  assert.equal(volume.receiptTotalCubicVolume([cubic, piece, tiny]), 0.045001);
  assert.equal(volume.formatReceiptCubicVolume(0.045001), "0.04500");
  assert.equal(volume.formatReceiptCubicVolume(0.000001), "0.00000");
});
test("A4 and A5 customer sheets keep the requested RTL columns and right totals", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next/image", { default: () => null });
  try {
    const { PublicInvoiceSheet } = load("@/app/modules/invoices/components/public-invoice-sheet");
    const invoice = { invoiceNumber: "INV-0001", createdAt: "2026-10-15T14:33:00.000Z", type: "cash_sale", status: "saved", customerName: null, total: 450, discount: 0, paid: 0, remaining: 450, lines: [{ itemLabel: "14ملي مربع", quantity: 2, thickness: 0.25, width: 0.15, length: 0.6, pricingModeSnapshot: "per_piece", piecePrice: 225, lineTotal: 450, note: null }] };
    for (const compact of [false, true]) {
      const html = renderToStaticMarkup(React.createElement(PublicInvoiceSheet, { invoice, compact }));
      const headings = receiptHeadings(html);
      assert.deepEqual(headings, ["الصنف", "العدد", "التخانة", "العرض", "الطول", "سعر الوحدة", "الإجمالي"]);
      assert.match(html, /فاتورة #0001/);
      assert.match(html, /2026\/10\/15 05:33 م/);
      assert.match(html, /justify-start/);
      assert.match(html, /bg-receipt-header/);
      assert.match(html, /text-\[\#b85d19\][^>]*>فاتورة #0001/);
      assert.match(html, /text-\[\#b85d19\][^>]*>450<\/span>/);
      assert.match(html, /<bdi dir="ltr">14<\/bdi> ملي مربع/);
      assert.doesNotMatch(html, /print-color-adjust:exact/);
      assert.match(html, compact ? /padding:3mm/ : /padding:12mm/);
      assert.match(html, compact ? /h-8 flex items-center justify-center whitespace-nowrap/ : /h-9 flex items-center justify-center whitespace-nowrap/);
      assert.match(html, compact ? /px-\[11px\]/ : /px-3/);
      assert.match(html, compact ? /text-\[\#666\] text-\[10px\]/ : /text-\[\#666\] text-\[11px\]/);
      assert.match(html, /flex flex-col items-center/);
      assert.doesNotMatch(html, /إجمالي المكعب/);
      const withoutPrices = renderToStaticMarkup(React.createElement(PublicInvoiceSheet, { invoice, compact, showPrices: false }));
      assert.deepEqual(receiptHeadings(withoutPrices), ["الصنف", "العدد", "التخانة", "العرض", "الطول"]);
      assert.doesNotMatch(withoutPrices, /المطلوب:/);
    }
    const noDimensions = { ...invoice, lines: [{ ...invoice.lines[0], thickness: null, width: null, length: null }] };
    const html = renderToStaticMarkup(React.createElement(PublicInvoiceSheet, { invoice: noDimensions }));
    assert.deepEqual(receiptHeadings(html), ["الصنف", "العدد", "سعر الوحدة", "الإجمالي"]);
  } finally { overrides.delete("next/image"); }
});
test("the in-app invoice preview matches the customer receipt headings", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  overrides.set("next/image", { default: () => null });
  try {
    const { InvoicePreviewModal } = load("@/app/modules/invoices/components/invoice-preview-modal");
    const initialInvoice = { id: "one", invoiceNumber: "INV-0001", createdAt: "2026-10-15T14:33:00.000Z", type: "cash_sale", status: "saved", total: 450, discount: 0, paid: 0, remaining: 450, lines: [{ itemId: "wood", quantity: 2, thickness: .25, width: .15, length: .6, pricingModeSnapshot: "per_piece", piecePrice: 225, lineTotal: 450, note: null }] };
    const html = renderToStaticMarkup(React.createElement(InvoicePreviewModal, { open: true, invoiceId: "one", initialInvoice }));
    assert.deepEqual(receiptHeadings(html), ["الصنف", "العدد", "التخانة", "العرض", "الطول", "سعر الوحدة", "الإجمالي"]);
    assert.match(html, /فاتورة #0001/);
    assert.match(html, /2026\/10\/15 05:33 م/);
    assert.match(html, /bg-receipt-header/);
    assert.match(html, /flex h-9 items-center justify-center whitespace-nowrap/);
    assert.match(html, /text-\[\#b85d19\][^>]*>فاتورة #0001/);
    assert.match(html, /text-\[\#b85d19\][^>]*>450<\/span>/);
    assert.match(html, /text-\[11px\] text-\[\#666\]/);
    assert.match(html, /flex flex-col items-center/);
    assert.doesNotMatch(html, /print-color-adjust:exact/);
    assert.match(html, /padding: 8mm !important/);
    assert.match(html, /justify-start/);
  } finally {
    overrides.delete("next-intl");
    overrides.delete("next/image");
  }
});
test("mixed cubic receipts show the volume column and summary even without prices", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next/image", { default: () => null });
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  try {
    const { PublicInvoiceSheet } = load("@/app/modules/invoices/components/public-invoice-sheet");
    const { InvoicePreviewModal } = load("@/app/modules/invoices/components/invoice-preview-modal");
    const cubic = { itemId: "cubic", itemLabel: "خشب طويل جدا للاختبار", pricingModeSnapshot: "per_cubic_meter", quantity: 2, thickness: 0.25, width: 0.15, length: 0.6, piecePrice: 1000, lineTotal: 45, note: null };
    const piece = { ...cubic, itemId: "piece", itemLabel: "قطعة", pricingModeSnapshot: "per_piece", quantity: 1, lineTotal: 1000 };
    const shared = { invoiceNumber: "INV-0002", createdAt: "2026-10-15T14:33:00.000Z", type: "cash_sale", status: "saved", total: 1045, discount: 0, paid: 0, remaining: 1045, lines: [cubic, piece] };
    const expected = ["الصنف", "العدد", "التخانة", "العرض", "الطول", "المكعب", "سعر الوحدة", "الإجمالي"];
    for (const compact of [false, true]) {
      for (const showPrices of [false, true]) {
        const html = renderToStaticMarkup(React.createElement(PublicInvoiceSheet, { invoice: { ...shared, customerName: null }, compact, showPrices }));
        const headings = receiptHeadings(html);
        assert.deepEqual(headings, showPrices ? expected : expected.slice(0, 6));
        assert.doesNotMatch(html, /إجمالي المكعب/);
        const footer = html.match(/<tfoot>([\s\S]*?)<\/tfoot>/)?.[1];
        assert.ok(footer);
        const footerRows = [...footer.matchAll(/<tr([^>]*)>([\s\S]*?)<\/tr>/g)];
        assert.equal(footerRows.length, 1);
        assert.match(footerRows[0][1], /border-t-2/);
        const cubicFooterCells = [...footerRows[0][2].matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)];
        assert.match(cubicFooterCells[0][2], /الإجمالي/);
        assert.match(cubicFooterCells[2][1], /colSpan="3"/);
        assert.match(cubicFooterCells[3][2], /0\.04500/);
        assert.equal([...html.matchAll(/0\.04500/g)].length, 2);
        assert.match(html, /receipt-volume-cell/);
        assert.match(html, /قطعة[\s\S]*?receipt-volume-cell[^>]*><\/td>/);
        if (!showPrices) assert.doesNotMatch(html, /المطلوب:/);
      }
    }
    const preview = renderToStaticMarkup(React.createElement(InvoicePreviewModal, {
      open: true,
      invoiceId: "one",
      initialInvoice: { ...shared, id: "one", lines: [cubic, piece] },
    }));
    assert.deepEqual(receiptHeadings(preview), expected);
    assert.doesNotMatch(preview, /إجمالي المكعب/);
    const previewFooter = preview.match(/<tfoot>([\s\S]*?)<\/tfoot>/)?.[1];
    assert.ok(previewFooter);
    const previewRows = [...previewFooter.matchAll(/<tr([^>]*)>([\s\S]*?)<\/tr>/g)];
    assert.equal(previewRows.length, 1);
    assert.match(previewRows[0][1], /border-t-2/);
    const previewCubicCells = [...previewRows[0][2].matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)];
    assert.match(previewCubicCells[0][2], /الإجمالي/);
    assert.match(previewCubicCells[2][1], /colSpan="3"/);
    assert.match(previewCubicCells[3][2], /0\.04500/);
    assert.equal([...preview.matchAll(/0\.04500/g)].length, 2);
  } finally {
    overrides.delete("next-intl");
    overrides.delete("next/image");
  }
});
test("late dimension responses preserve changed/removed lines and other fields", () => {
  const { applySavedDimension } = load(
    "@/app/modules/shared/utils/saved-dimension",
  );
  const line = {
    key: "row",
    itemId: "piece",
    thickness: "0.018",
    width: "1.22",
    note: "keep",
    piecePrice: "450",
  };
  assert.deepEqual(
    applySavedDimension([line], "row", "piece", "thickness", 0.02, true),
    [{ ...line, thickness: "0.02" }],
  );
  assert.deepEqual(
    applySavedDimension(
      [{ ...line, itemId: "other" }],
      "row",
      "piece",
      "thickness",
      0.02,
      true,
    ),
    [{ ...line, itemId: "other" }],
  );
  assert.deepEqual(
    applySavedDimension([], "row", "piece", "thickness", 0.02, true),
    [],
  );
  assert.deepEqual(
    applySavedDimension([line], "row", "piece", "thickness", 0.02, false),
    [line],
  );
});
test("out-of-order saved defaults merge without losing another addition", () => {
  const { mergeDimensionDefaults } = load(
    "@/app/modules/items/utils/dimension-defaults",
  );
  assert.deepEqual(
    mergeDimensionDefaults(
      { thickness: [0.018, 0.03], width: [1.22], length: [] },
      { thickness: [0.025, 0.018], width: [1.22], length: [2.44] },
    ),
    { thickness: [0.018, 0.025, 0.03], width: [1.22], length: [2.44] },
  );
});
test("PDF utility retains the element, filename and renderer options used by Save & Print and public receipts", async () => {
  const calls = {};
  const renderer = {
    set(options) {
      calls.options = options;
      return this;
    },
    from(element) {
      calls.element = element;
      return this;
    },
    save() {
      calls.saved = true;
      return Promise.resolve();
    },
  };
  overrides.set("html2pdf.js", { default: () => renderer });
  const element = { id: "sheet" };
  const originalDocument = globalThis.document;
  globalThis.document = {
    getElementById: (id) => (id === "sheet" ? element : null),
  };
  try {
    const pdf = load("@/app/modules/invoices/utils/invoice-pdf");
    await pdf.downloadInvoicePdf("sheet", "INV-0010");
    assert.equal(calls.element, element);
    assert.equal(calls.saved, true);
    assert.equal(calls.options.filename, "فاتورة-0010.pdf");
    assert.deepEqual(calls.options.jsPDF, {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    assert.equal(typeof calls.options.html2canvas.onclone, "function");
    calls.saved = false;
    await pdf.downloadInvoicePdf("missing", "INV-0010");
    assert.equal(calls.saved, false);
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    overrides.delete("html2pdf.js");
  }
});

test("canvas exports center header labels only in the cloned receipt", () => {
  const { prepareReceiptCanvasClone } = load("@/app/modules/invoices/utils/receipt-canvas");
  const sheets = ["sheet", "sheet", "other"].map((id) => ({
    id,
    dir: "",
    style: {},
    labels: [{ style: {} }, { style: {} }],
    querySelectorAll() { return this.labels; },
  }));
  prepareReceiptCanvasClone({ querySelectorAll: () => sheets }, "sheet");
  for (const sheet of sheets.slice(0, 2)) {
    assert.equal(sheet.dir, "rtl");
    assert.equal(sheet.style.direction, "rtl");
    assert.deepEqual(sheet.labels.map((label) => label.style.top), ["-7px", "-7px"]);
    assert.deepEqual(sheet.labels.map((label) => label.style.position), ["relative", "relative"]);
  }
  assert.equal(sheets[2].dir, "");
});

test("A4 PDF and A5 PNG files use the customer-facing invoice number", async () => {
  const renderer = {
    set() { return this; },
    from() { return this; },
    async outputPdf() { return new Blob(["pdf"]); },
    toCanvas() { return { get: async () => ({ toBlob(callback) { callback(new Blob(["png"])); } }) }; },
  };
  overrides.set("html2pdf.js", { default: () => renderer });
  try {
    const { createInvoiceFile } = load("@/app/modules/invoices/utils/invoice-file");
    const element = { id: "sheet", querySelectorAll: () => [] };
    assert.equal((await createInvoiceFile(element, "INV-0001", "pdf")).name, "فاتورة-0001.pdf");
    assert.equal((await createInvoiceFile(element, "INV-0001", "png")).name, "فاتورة-0001.png");
  } finally { overrides.delete("html2pdf.js"); }
});


test("Egyptian phones normalize local/international input, limit digits and reject unsupported pastes", () => {
  const { normalizeMobile, isOptionalMobile, mobileInputValue, formatMobileInput } = load("@/app/modules/shared/utils/egyptian-mobile");
  assert.equal(normalizeMobile("+20 109 690 7203"), "01096907203");
  assert.equal(mobileInputValue("01096907203"), "01096907203");
  assert.equal(mobileInputValue("+201096907203"), "01096907203");
  assert.equal(mobileInputValue("109 690 72034"), null);
  assert.equal(mobileInputValue("00201096907203"), null);
  assert.equal(mobileInputValue("+441234567890"), null);
  assert.equal(mobileInputValue(""), "");
  assert.equal(formatMobileInput("01096907203"), "109 690 7203");
  for (const value of ["01096907203", "01123456789", "01223456789", "01523456789", "", "+201096907203"]) assert.equal(isOptionalMobile(value), true);
  for (const value of ["1", "0223456789", "01323456789", "010969072034", "00201096907203"]) assert.equal(isOptionalMobile(value), false);
});

test("money validation rejects nonfinite, negative and excess precision values", () => {
  const { isMoneyAmount } = load("@/app/modules/shared/utils/money-validation");
  for (const value of [0, 1.23, 1.01, 100]) assert.equal(isMoneyAmount(value), true);
  for (const value of [Infinity, NaN, -1, 1.234]) assert.equal(isMoneyAmount(value), false);
});

test("line validation rejects zero rounded volumes and overflow, preserving descriptive piece dimensions", () => {
  const { isUsableLine } = load("@/app/modules/shared/utils/line-validation");
  const base = { pricingMode: "per_cubic_meter", quantity: 1, piecePrice: 20000, thicknessM: 0.1, widthM: 0.2, lengthM: 0.3 };
  assert.equal(isUsableLine(base), true);
  assert.equal(isUsableLine({ ...base, thicknessM: 0.000001, widthM: 0.000001, lengthM: 0.000001 }), false);
  assert.equal(isUsableLine({ ...base, quantity: 1e308 }), false);
  assert.equal(isUsableLine({ ...base, pricingMode: "per_piece", thicknessM: 0, widthM: 0, lengthM: 0 }), true);
});

test("free-amount lines charge once without quantity or dimensions", () => {
  const { lineTotalForPricing } = load("@/app/modules/shared/utils/invoice-math");
  const { isUsableLine } = load("@/app/modules/shared/utils/line-validation");
  const { lineTotalForFormLine } = load("@/app/modules/invoices/utils/invoice-form");
  const item = { id: "charge", pricingMode: "free_amount" };
  const line = { itemId: "charge", quantity: "", piecePrice: "125.50", thickness: "", width: "", length: "" };
  assert.equal(lineTotalForPricing({ pricingMode: "free_amount", quantity: 10, piecePrice: 125.5 }), 125.5);
  assert.equal(lineTotalForFormLine(line, new Map([[item.id, item]])), 125.5);
  assert.equal(isUsableLine({ pricingMode: "free_amount", quantity: 0, piecePrice: 125.5, thicknessM: 0, widthM: 0, lengthM: 0 }), true);
  assert.equal(isUsableLine({ pricingMode: "free_amount", quantity: 1, piecePrice: 0, thicknessM: 0, widthM: 0, lengthM: 0 }), false);
});

test("mixed receipts hide canonical fields for free-amount lines", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next/image", { default: () => null });
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  try {
    const { PublicInvoiceSheet } = load("@/app/modules/invoices/components/public-invoice-sheet");
    const { InvoicePreviewModal } = load("@/app/modules/invoices/components/invoice-preview-modal");
    const physical = { itemId: "wood", itemLabel: "خشب", pricingModeSnapshot: "per_piece", quantity: 2, thickness: 0.2, width: 0.1, length: 1, piecePrice: 100, lineTotal: 200, note: null };
    const charge = { itemId: "charge", itemLabel: "تصنيع مكتب", pricingModeSnapshot: "free_amount", quantity: 1, thickness: null, width: null, length: null, piecePrice: 125.5, lineTotal: 125.5, note: "ملاحظة" };
    const invoice = { id: "one", invoiceNumber: "INV-0001", createdAt: "2026-10-15T14:33:00.000Z", type: "cash_sale", status: "saved", customerName: null, total: 325.5, discount: 0, paid: 325.5, remaining: 0, lines: [physical, charge] };
    for (const compact of [false, true]) for (const showPrices of [false, true]) {
      const html = renderToStaticMarkup(React.createElement(PublicInvoiceSheet, { invoice, compact, showPrices }));
      const row = html.match(/تصنيع مكتب[\s\S]*?<\/tr>/)?.[0];
      assert.ok(row);
      assert.match(row, /ملاحظة/);
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) => match[1].replace(/<[^>]*>/g, "").trim());
      assert.deepEqual(cells.slice(0, 4), ["", "", "", ""]);
      assert.match(html.match(/<tfoot>[\s\S]*?<\/tfoot>/)?.[0] ?? "", />2<\/td>/);
      if (showPrices) assert.match(row, /125\.50/);
    }
    const preview = renderToStaticMarkup(React.createElement(InvoicePreviewModal, { open: true, invoiceId: "one", initialInvoice: invoice }));
    const previewRow = preview.match(/ملاحظة[\s\S]*?<\/tr>/)?.[0];
    assert.ok(previewRow);
    assert.match(previewRow, /ملاحظة/);
    assert.match(previewRow, /125\.50/);
  } finally { overrides.delete("next/image"); overrides.delete("next-intl"); }
});

test("invoice navigation carries its selected mode to both destinations and disables customer mode for cash sales", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  overrides.set("@/i18n/navigation", { Link: ({ children, ...props }) => React.createElement("a", props, children) });
  try {
    const { InvoiceNavigation } = load("@/app/modules/invoices/components/invoice-navigation");
    const props = { neighbors: { previousId: "customer-prev", nextId: "customer-next", previousByNumberId: "number-prev", nextByNumberId: null }, isCustomerSale: true, mode: "customer", onModeChange() {} };
    const customer = renderToStaticMarkup(React.createElement(InvoiceNavigation, props));
    assert.match(customer, /href="\/invoices\/customer-prev\?navigation=customer"/);
    assert.match(customer, /href="\/invoices\/customer-next\?navigation=customer"/);
    const cash = renderToStaticMarkup(React.createElement(InvoiceNavigation, { ...props, isCustomerSale: false }));
    assert.match(cash, /href="\/invoices\/number-prev\?navigation=number"/);
    assert.doesNotMatch(cash, /href="\/invoices\/customer-/);
    assert.match(cash, /disabled=""/);
  } finally {
    overrides.delete("next-intl");
    overrides.delete("@/i18n/navigation");
  }
});

test("phone fields show errors only when requested and retain the unfilled generic guide", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  try {
    const { EgyptianPhoneInput } = load("@/app/modules/shared/components/egyptian-phone-input");
    const props = { name: "test-phone", label: "Phone", value: "010", onValueChange() {} };
    const typing = renderToStaticMarkup(React.createElement(EgyptianPhoneInput, props));
    assert.doesNotMatch(typing, /role="alert"/);
    assert.doesNotMatch(typing, /109 690 7203/);
    assert.match(typing, /XXX XXXX/);
    const submitted = renderToStaticMarkup(React.createElement(EgyptianPhoneInput, { ...props, showError: true }));
    assert.match(submitted, /role="alert"/);
    const corrected = renderToStaticMarkup(React.createElement(EgyptianPhoneInput, { ...props, value: "01012345678", showError: true }));
    assert.doesNotMatch(corrected, /role="alert"/);
  } finally { overrides.delete("next-intl"); }
});

test("an incomplete phone does not disable the customer or supplier submit button", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  try {
    for (const [feature, party] of [["customers", "customer"], ["suppliers", "supplier"]]) {
      const mod = load(`@/app/modules/${feature}/components/${party}-form-modal`);
      const Component = mod[party === "customer" ? "CustomerFormModal" : "SupplierFormModal"];
      const html = renderToStaticMarkup(React.createElement(Component, { open: true, mode: "create", name: "Test", phone: "010", originalPhone: "", address: "", balance: "", amountOwed: "", isSubmitting: false, onSubmit() {}, onClose() {} }));
      const submit = html.match(/<button[^>]*type="submit"[^>]*>/)?.[0];
      assert.ok(submit);
      assert.doesNotMatch(submit, /\sdisabled=/);
    }
  } finally { overrides.delete("next-intl"); }
});

test("public invoices show Arabic PDF print guidance outside the captured receipt and hide it on print", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  const messages = JSON.parse(readFileSync(resolve(root, "messages/ar.json"), "utf8")).invoices;
  overrides.set("../hooks/use-public-invoice", { usePublicInvoice: () => ({ invoice: {}, isLoading: false, error: null, isDownloading: false, handleDownload() {} }) });
  overrides.set("../components/public-invoice-sheet", { PublicInvoiceSheet: () => React.createElement("div", { id: "public-invoice-sheet" }, "receipt") });
  overrides.set("next/image", { default: () => null });
  try {
    const { PublicInvoicePageClient } = load("@/app/modules/invoices/pages/public-invoice-page");
    const html = renderToStaticMarkup(React.createElement(PublicInvoicePageClient, { token: "test", printGuidanceTitle: messages.printGuidanceTitle, printGuidanceMessage: messages.printGuidancePdf }));
    assert.ok(html.includes(messages.printGuidancePdf));
    assert.match(html, /<aside[^>]*class="[^"]*print:hidden/);
    assert.ok(html.indexOf("</aside>") < html.indexOf('id="public-invoice-sheet"'));
    assert.match(html, /padding: 8mm !important/);
  } finally {
    overrides.delete("../hooks/use-public-invoice");
    overrides.delete("../components/public-invoice-sheet");
    overrides.delete("next/image");
  }
});

test("export printing fills the selected paper instead of retaining the download width", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useLocale: () => "ar", useTranslations: () => (key) => key });
  overrides.set("@/i18n/navigation", { Link: ({ children, ...props }) => React.createElement("a", props, children) });
  try {
    const { InvoiceExportPage } = load("@/app/modules/invoices/pages/invoice-export-page");
    const html = renderToStaticMarkup(React.createElement(InvoiceExportPage, { invoiceId: "one" }));
    assert.match(html, /\.invoice-export-sheet-wrapper \{[^}]*width: 100% !important/);
    assert.match(html, /#export-invoice-sheet \{[^}]*padding: 8mm !important/);
    assert.doesNotMatch(html, /@page \{ size:/);
  } finally {
    overrides.delete("next-intl");
    overrides.delete("@/i18n/navigation");
  }
});

test("invoice print pages load a zero-margin page rule without fixing the paper size", () => {
  const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
  assert.match(css, /@page\s*\{\s*margin:\s*0;\s*\}/);
  assert.doesNotMatch(css, /@page\s*\{[^}]*size:/);
});

test("audit summaries describe known persisted actions and preserve unknown text", () => {
  const { describeAuditSummary, formatAuditSummary } = load("@/app/modules/audit/utils/format-audit-value");
  const describe = (action, summary) => describeAuditSummary({ action, summary }, "إجراء", (field) => ({ unitPrice: "سعر الوحدة" })[field] ?? field);
  assert.deepEqual(describe("invoice_created", "Invoice created: INV-9085"), {
    key: "summaryWithValue", values: { action: "إجراء", value: "INV-9085" },
  });
  assert.deepEqual(describe("customer_created", "Customer created: محمد"), {
    key: "summaryWithValue", values: { action: "إجراء", value: "محمد" },
  });
  assert.deepEqual(describe("payment_recorded", "Payment of 1500 EGP recorded for customer: أحمد"), {
    key: "summaryPaymentForCustomer", values: { action: "إجراء", amount: "1500", name: "أحمد" },
  });
  assert.deepEqual(describe("supplier_payment_cancelled", "Payment of 80 EGP cancelled for supplier: خالد"), {
    key: "summaryPaymentForSupplier", values: { action: "إجراء", amount: "80", name: "خالد" },
  });
  assert.deepEqual(describe("purchase_created", "Purchase invoice created: PUR-0005 for supplier: خالد"), {
    key: "summaryPurchaseCreated", values: { number: "PUR-0005", supplier: "خالد" },
  });
  assert.deepEqual(describe("customer_merged", "Customers merged: أ, ب → ج"), {
    key: "summaryMerged", values: { action: "إجراء", sources: "أ, ب", target: "ج" },
  });
  assert.deepEqual(describe("price_changed", "unitPrice: 5 → 6"), {
    key: "summaryPriceChanged", values: { field: "سعر الوحدة", old: "5", new: "6" },
  });
  assert.deepEqual(describe("item_edited", "Item dimension defaults updated: خشب"), {
    key: "summaryDimensionDefaultsUpdated", values: { name: "خشب" },
  });
  assert.deepEqual(describe("operating_expense_created", null), {
    key: "summaryActionOnly", values: { action: "إجراء" },
  });
  assert.equal(describe("invoice_created", "Unexpected text: INV-9085"), null);
  assert.equal(formatAuditSummary("Unexpected text: INV-9085"), "Unexpected text: INV-9085");
});

test("audit change labels and coded values are available in both locales", () => {
  const { AUDIT_FIELD_KEYS, AUDIT_VALUE_CODES_BY_FIELD } = load("@/app/modules/audit/utils/audit-catalog");
  const { formatAuditChangeValue } = load("@/app/modules/audit/utils/format-audit-value");
  assert.ok(AUDIT_FIELD_KEYS.includes("existingDebtPayment"));
  assert.ok(AUDIT_FIELD_KEYS.includes("dimensionDefaults"));
  for (const locale of ["ar", "en"]) {
    const audit = JSON.parse(readFileSync(resolve(root, `messages/${locale}.json`), "utf8")).audit;
    for (const field of AUDIT_FIELD_KEYS) assert.ok(audit.fields[field], `${locale}: ${field}`);
    for (const code of Object.values(AUDIT_VALUE_CODES_BY_FIELD).flat()) assert.ok(audit.values[code], `${locale}: ${code}`);
    const labels = {
      value: (field, code) => code === "true" || code === "false" || AUDIT_VALUE_CODES_BY_FIELD[field]?.includes(code)
        ? audit.values[code] : null,
      dimension: (field) => audit.fields[field],
    };
    assert.equal(formatAuditChangeValue("status", "saved", locale, audit.emptyValue, labels), audit.values.saved);
    assert.equal(formatAuditChangeValue("isActive", true, locale, audit.emptyValue, labels), audit.values.true);
    assert.equal(formatAuditChangeValue("dimensionDefaults", { thickness: [0.2], width: [], length: [2, 3] }, locale, audit.emptyValue, labels),
      `${audit.fields.thickness}: 0.2${locale === "ar" ? "؛ " : "; "}${audit.fields.length}: 2, 3`);
  }
});

test("audit table renders persisted summaries in the selected language", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  const { createTranslator } = nativeRequire("next-intl");
  let locale = "ar";
  overrides.set("next-intl", {
    useLocale: () => locale,
    useTranslations: (namespace) => createTranslator({
      locale,
      messages: JSON.parse(readFileSync(resolve(root, `messages/${locale}.json`), "utf8")),
      namespace,
    }),
  });
  try {
    const { AuditLogTable } = load("@/app/modules/audit/components/audit-log-table");
    const logs = [
      { id: "invoice", createdAt: "2026-10-19T15:55:00Z", user: { id: "user", username: "superadmin" }, action: "invoice_created", entityType: "SalesInvoice", summary: "Invoice created: INV-9085", changes: null },
      { id: "customer", createdAt: "2026-10-19T15:53:00Z", user: { id: "user", username: "superadmin" }, action: "customer_created", entityType: "Customer", summary: "Customer created: محمد", changes: null },
    ];
    const render = () => renderToStaticMarkup(React.createElement(AuditLogTable, { logs, status: "success", error: null, hasActiveFilters: false, onRetry() {} }));
    const arabic = render();
    assert.match(arabic, /إنشاء فاتورة: INV-9085/);
    assert.match(arabic, /إنشاء عميل: محمد/);
    assert.doesNotMatch(arabic, /Invoice created:/);
    locale = "en";
    const english = render();
    assert.match(english, /Invoice created: INV-9085/);
    assert.match(english, /Customer created: محمد/);
  } finally {
    overrides.delete("next-intl");
  }
});
