import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
const native = createRequire(import.meta.url);
const root = resolve(".");
function load(name, stubs = {}, cache = new Map(), parent = root) {
  if (name in stubs) return stubs[name];
  if (!name.startsWith(".") && !name.startsWith("@/")) return native(name);
  let file = resolve(name.startsWith("@/") ? root : parent, name.startsWith("@/") ? name.slice(2) : name);
  if (!/\.tsx?$/.test(file))
    file += (() => {
      try {
        readFileSync(file + ".ts");
        return ".ts";
      } catch {
        return ".tsx";
      }
    })();
  if (cache.has(file)) return cache.get(file);
  const out = {};
  cache.set(file, out);
  new Function(
    "exports",
    "require",
    ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  )(out, (dep) => load(dep, stubs, cache, dirname(file)));
  return out;
}
test("detail display matches print pricing and volume without changing saved amounts", () => {
  const u = load("@/app/modules/shared/utils/invoice-line-display");
  const receipt = load("@/app/modules/invoices/utils/receipt-volume");
  const line = {
    quantity: 3,
    thickness: 0.1,
    width: 0.2,
    length: 1,
    unitRate: 1000,
    pricingModeSnapshot: "per_cubic_meter",
  };
  assert.equal(u.invoiceLineUnitPrice(line), 20);
  assert.equal(u.invoiceLineVolume(line), 0.06);
  assert.equal(u.invoiceLineVolume({ ...line, pricingModeSnapshot: "per_piece" }), null);
  assert.equal(u.invoiceLineUnitPrice({ ...line, pricingModeSnapshot: "per_piece" }), 1000);
  assert.equal(u.invoiceLineVolume({ ...line, pricingModeSnapshot: "free_amount" }), null);
  assert.equal(u.invoiceLineVolume({ ...line, pricingModeSnapshot: undefined }), 0.06);
  assert.equal(u.formatInvoiceVolume(0.06), "0.06");
  for (const pricingModeSnapshot of ["per_cubic_meter", "per_piece", "free_amount", undefined]) {
    for (const quantity of [0, 1, 3, 11]) {
      const savedLine = {
        ...line,
        pricingModeSnapshot,
        quantity,
        thickness: 0.018,
        width: 1.22,
        length: 2.44,
      };
      assert.equal(u.invoiceLineVolume(savedLine), receipt.receiptLineCubicVolume(savedLine));
    }
  }
  for (const volume of [0, 0.000001, 0.123456, 1.06, 1000]) {
    assert.equal(u.formatInvoiceVolume(volume), receipt.formatReceiptCubicVolume(volume));
  }
});
const React = native("react");
const { renderToStaticMarkup } = native("react-dom/server");
function environment(locale) {
  const messages = JSON.parse(readFileSync("messages/" + locale + ".json", "utf8"));
  return {
    "next-intl": {
      useLocale: () => locale,
      useTranslations: (namespace) => native("next-intl").createTranslator({ locale, namespace, messages }),
    },
    "@/i18n/navigation": {
      Link: ({ children, ...props }) => React.createElement("a", props, children),
    },
  };
}
test("detail table localizes units, shows derived price plus rate and saved footer; free amounts stay blank", () => {
  for (const locale of ["ar", "en"]) {
    const { InvoiceDetailTable } = load("@/app/modules/shared/components/invoice-detail-table", environment(locale));
    const html = renderToStaticMarkup(
      React.createElement(InvoiceDetailTable, {
        total: 999,
        unavailableLabel: "Missing",
        lines: [
          {
            itemId: "cube",
            name: "Cube",
            quantity: 3,
            thickness: 0.1,
            width: 0.2,
            length: 1,
            unitRate: 1000,
            lineTotal: 60,
            note: "Note",
            pricingModeSnapshot: "per_cubic_meter",
          },
          {
            itemId: "free",
            name: "Free",
            quantity: 99,
            thickness: null,
            width: null,
            length: null,
            unitRate: 939,
            lineTotal: 939,
            note: null,
            pricingModeSnapshot: "free_amount",
          },
        ],
      }),
    );
    assert.match(html, /0\.06/);
    assert.match(html, /999/);
    assert.match(html, /Note/);
    assert.match(html, /overflow-x-auto/);
    assert.match(html, locale === "ar" ? /م³/ : /m³/);
    assert.match(html, /<tfoot>[\s\S]*?>3<\/td>/);
    assert.doesNotMatch(html, />99</);
    assert.match(html, /1,000/);
  }
});
test("party names link only when a valid party destination is supplied", () => {
  const { InvoicePartySection } = load("@/app/modules/shared/components/invoice-party-section", environment("en"));
  const render = (href) =>
    renderToStaticMarkup(
      React.createElement(InvoicePartySection, {
        label: "Customer",
        name: "Long Party Name",
        href,
      }),
    );
  assert.match(render("/customers/one"), /href="\/customers\/one"/);
  assert.doesNotMatch(render(), /href=/);
  assert.match(render(), /break-words/);
});
for (const kind of ["sales", "purchase"])
  test(kind + " detail groups header actions and statuses and hides stale records", () => {
    const invoice = {
      id: "one",
      invoiceNumber: "INV-1",
      customerId: "c",
      type: "customer_sale",
      customer: { id: "c", name: "Customer" },
      status: "saved",
      createdAt: "2026-11-01",
      total: 60,
      discount: 0,
      paid: 0,
      remaining: 60,
      lines: [
        {
          itemId: "cube",
          quantity: 3,
          thickness: 0.1,
          width: 0.2,
          length: 1,
          piecePrice: 1000,
          unitCost: 1000,
          lineTotal: 60,
          note: null,
          pricingModeSnapshot: "per_cubic_meter",
        },
      ],
    };
    let state = {
      invoice,
      purchase: invoice,
      supplier: { id: "s", name: "Supplier" },
      customerName: "Customer",
      itemsById: { cube: { name: "Cube" } },
      itemsMap: { cube: { name: "Cube" } },
      status: "success",
      error: null,
      refresh() {},
      clearToast() {},
      openCancel() {},
      openCancelConfirm() {},
      closeCancel() {},
      closeCancelConfirm() {},
    };
    const stubs = {
      ...environment("en"),
      "next/navigation": { useSearchParams: () => new URLSearchParams() },
      "@/app/layout/app-shell": {
        AppShell: ({ children, actions, title, subtitle, metadata }) =>
          React.createElement(
            "div",
            null,
            React.createElement("header", null, title, subtitle, metadata, actions),
            React.createElement("main", null, children),
          ),
      },
      "@/app/modules/shared/hooks/use-app-navigation": {
        useAppNavigation: () => ({ push() {} }),
      },
      "@/app/modules/shared/components/back-button": {
        BackButton: () => null,
      },
      "@/app/modules/shared/components/toast": { Toast: () => null },
      "@/app/modules/shared/components/row-actions-menu": {
        ConfirmDialog: () => null,
      },
      "@/app/modules/invoices/components/cancel-invoice-dialog": {
        CancelInvoiceDialog: () => null,
      },
      "../hooks/use-invoice-neighbors": {
        useInvoiceNeighbors: () => ({ neighbors: null, failed: false }),
      },
      "../components/invoice-navigation": {
        InvoiceNavigation: () => React.createElement("nav", null, "Navigation"),
      },
      "@/app/modules/invoices/components/invoice-share-modal": {
        InvoiceShareModal: () => null,
      },
      "@/app/modules/invoices/hooks/use-invoice-detail": {
        useInvoiceDetail: () => state,
      },
      "@/app/modules/purchases/hooks/use-purchase-detail": {
        usePurchaseDetail: () => state,
      },
    };
    const Component =
      kind === "sales"
        ? load("@/app/modules/invoices/pages/invoice-detail-page", stubs).InvoiceDetailPage
        : load("@/app/modules/purchases/pages/purchase-detail-page", stubs).PurchaseDetailPage;
    const render = () =>
      renderToStaticMarkup(
        React.createElement(Component, kind === "sales" ? { invoiceId: "one" } : { purchaseId: "one" }),
      );
    let html = render();
    assert.match(html, kind === "sales" ? /href="\/customers\/c"/ : /href="\/suppliers\/s"/);
    const header = html.match(/<header>[\s\S]*?<\/header>/)[0];
    assert.doesNotMatch(header, /Customer|Supplier/);
    assert.match(header, /Saved/);
    assert.match(header, /Unpaid balance/);
    assert.match(header, /href="\/(invoices|purchases)\/one\/edit"/);
    if (kind === "sales") assert.match(header, /Print[\s\S]*WhatsApp[\s\S]*Edit/);
    else assert.doesNotMatch(header, /Print|WhatsApp/);
    assert.match(html, /<tfoot>/);
    assert.match(html, /1,000/);
    if (kind === "sales") {
      assert.ok(html.indexOf("<nav>") < html.indexOf('href="/customers/c"'));
    }
    const cancelled = { ...invoice, status: "cancelled" };
    state = { ...state, invoice: cancelled, purchase: cancelled };
    html = render();
    const cancelledHeader = html.match(/<header>[\s\S]*?<\/header>/)[0];
    assert.match(cancelledHeader, /Cancelled/);
    assert.doesNotMatch(html, /href="\/(invoices|purchases)\/one\/edit"/);
    if (kind === "sales") assert.match(cancelledHeader, /Print|WhatsApp/);
    for (const status of ["loading", "error"]) {
      state = { ...state, status, invoice, purchase: invoice };
      const unavailableHeader = render().match(/<header>[\s\S]*?<\/header>/)[0];
      assert.doesNotMatch(unavailableHeader, /Saved|Unpaid balance|Print|WhatsApp|href=/);
    }
    for (const status of ["loading", "error", "success"]) {
      state = {
        ...state,
        status,
        invoice: { ...invoice, id: "stale" },
        purchase: { ...invoice, id: "stale" },
      };
      html = render();
      assert.doesNotMatch(html, /href="\/invoices\/stale\/edit"|href="\/purchases\/stale\/edit"|<tfoot>/);
    }
  });
