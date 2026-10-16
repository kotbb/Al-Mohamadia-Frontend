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
  } finally {
    overrides.delete("../hooks/use-public-invoice");
    overrides.delete("../components/public-invoice-sheet");
    overrides.delete("next/image");
  }
});
