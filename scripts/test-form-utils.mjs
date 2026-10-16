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
function load(modulePath, parent = root) {
  let file = modulePath.startsWith("@/")
    ? resolve(root, modulePath.slice(2))
    : resolve(parent, modulePath);
  if (!existsSync(file)) file += ".ts";
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const output = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
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
  assert.equal(receipt.formatReceiptMoney(1700), "1,700 ج.م");
  assert.equal(receipt.formatReceiptMoney(10.5), "10.50 ج.م");
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
    assert.equal(calls.options.filename, "فاتورة-INV-0010.pdf");
    assert.deepEqual(calls.options.jsPDF, {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    calls.saved = false;
    await pdf.downloadInvoicePdf("missing", "INV-0010");
    assert.equal(calls.saved, false);
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    overrides.delete("html2pdf.js");
  }
});
