import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

test("receipt column layouts give optional-column space back to the item and always total 100 percent", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  const { ReceiptTableColumns } = load("@/app/modules/invoices/components/receipt-table-columns");
  for (const hasDimensions of [false, true]) {
    for (const hasCubic of [false, true]) {
      for (const showPrices of [false, true]) {
        const html = renderToStaticMarkup(React.createElement(ReceiptTableColumns, { hasDimensions, hasCubic, showPrices }));
        const widths = [...html.matchAll(/width:([0-9]+)%/g)].map((match) => Number(match[1]));
        const rest = [10, ...(hasDimensions ? [10, 10, 10] : []), ...(hasCubic ? [11] : []), ...(showPrices ? [11, 13] : [])];
        assert.deepEqual(widths, [100 - rest.reduce((sum, width) => sum + width, 0), ...rest]);
        assert.equal(widths.reduce((sum, width) => sum + width, 0), 100);
      }
    }
  }
});

test("receipt notes share Arabic spacing and isolated numbers across compact, standard and modal receipts", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next/image", { default: () => null });
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  try {
    const { PublicInvoiceSheet } = load("@/app/modules/invoices/components/public-invoice-sheet");
    const { InvoicePreviewModal } = load("@/app/modules/invoices/components/invoice-preview-modal");
    for (const note of ["4ملي", "4 ملي"]) {
      const piece = { itemId: "piece", itemLabel: "18 ام اف ساده", quantity: 1, thickness: 18, width: 122, length: 244, pricingModeSnapshot: "per_piece", piecePrice: 900, lineTotal: 900, note };
      const lines = [piece, { ...piece, itemLabel: "ابلاكاش 6 ملي ارو" }, { ...piece, itemLabel: "2.7 ملي ته مربع" },
        { ...piece, itemId: "cubic", itemLabel: "خشب", pricingModeSnapshot: "per_cubic_meter", thickness: .25, width: .15, length: .6 },
        { ...piece, itemId: "free", itemLabel: "مبلغ حر", pricingModeSnapshot: "free_amount", thickness: null, width: null, length: null }];
      const invoice = { id: "one", invoiceNumber: "INV-9124", type: "customer_sale", status: "saved", customerName: "عميل", total: 3753.04, discount: 0, paid: 1000, remaining: 2753.04, lines };
      const sheets = [false, true].map((compact) => renderToStaticMarkup(React.createElement(PublicInvoiceSheet, { invoice, compact })));
      sheets.push(renderToStaticMarkup(React.createElement(InvoicePreviewModal, { open: true, invoiceId: "one", initialInvoice: invoice })));
      for (const html of sheets) {
        assert.match(html, /<colgroup><col style="width:25%"/);
        assert.doesNotMatch(html.match(/<thead>[\s\S]*?<\/thead>/)?.[0] ?? "", /w-\[/);
        assert.match(html, /<bdi dir="ltr" class="inline-block whitespace-nowrap align-baseline">4<\/bdi> ملي/);
        assert.doesNotMatch(html, /\bitalic\b/);
        assert.match(html, /font-normal[^\"]*leading-relaxed/);
        assert.match(html, /3,753\.04/);
        assert.match(html, /2,753\.04/);
      }
      for (const html of sheets.slice(0, 2)) {
        const text = html.replace(/<[^>]+>/g, "");
        for (const label of ["18 ام اف ساده", "ابلاكاش 6 ملي ارو", "2.7 ملي ته مربع"]) assert.ok(text.includes(label));
      }
    }
  } finally { overrides.delete("next/image"); overrides.delete("next-intl"); }
});

test("invoice item search matches names and categories, supports keyboard choice and preserves selection", () => {
  const states = [];
  let cursor = 0;
  overrides.set("react", {
    useId: () => "item-picker",
    useRef(initial) { const index = cursor++; if (!(index in states)) states[index] = { current: initial }; return states[index]; },
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = initial; return [states[index], (value) => { states[index] = value; }]; },
  });
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  const file = resolve(root, "app/modules/shared/components/item-combobox.tsx");
  cache.delete(file);
  const chosen = [];
  const props = { labels: { label: "Item", placeholder: "Search", empty: "No items" }, name: "item-one", value: "", items: [
    { id: "oak", name: "Oak 18", category: { name: "Wood" }, isActive: true },
    { id: "pine", name: "Pine 12", category: { name: "Wood" }, isActive: true },
    { id: "arabic", name: "صنف", category: { name: "ألواح" }, isActive: true },
    { id: "inactive", name: "Hidden item", category: { name: "Wood" }, isActive: false },
  ], onSelect(id) { props.value = id; chosen.push(id); } };
  try {
    const { ItemCombobox } = load("@/app/modules/shared/components/item-combobox");
    const render = () => { cursor = 0; return ItemCombobox(props); };
    const nodes = (element) => !element || typeof element !== "object" ? [] : [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
    const input = () => nodes(render()).find((node) => node.props?.role === "combobox");
    const options = () => nodes(render()).filter((node) => node.props?.role === "option");
    const groups = () => nodes(render()).filter((node) => node.props?.role === "group");
    const key = (value) => input().props.onKeyDown({ key: value, preventDefault() {}, stopPropagation() {} });
    input().props.onFocus({ currentTarget: { select() {} } });
    assert.equal(options().length, 3);
    assert.equal(groups().length, 2);
    const woodGroup = groups().find((group) => nodes(group).some((node) => node.props?.children === "Wood"));
    assert.equal(nodes(woodGroup).filter((node) => node.props?.role === "option").length, 2);
    input().props.onChange({ target: { value: "  WOOD " } });
    assert.equal(options().length, 2);
    assert.equal(groups().length, 1);
    key("ArrowDown"); key("ArrowDown"); key("Enter");
    assert.equal(props.value, "pine");
    assert.equal(input().props.value, "Pine 12");
    input().props.onFocus({ currentTarget: { select() {} } }); key("Enter");
    assert.equal(chosen.length, 1, "reopening must not reset an existing line");
    input().props.onChange({ target: { value: "oak" } });
    assert.equal(options().length, 1); key("Enter");
    assert.equal(props.value, "oak");
    input().props.onChange({ target: { value: "ألواح" } });
    assert.equal(options().length, 1); key("ArrowUp"); key("Enter");
    assert.equal(props.value, "arabic");
    input().props.onChange({ target: { value: "no matches" } });
    assert.equal(options().length, 0); key("Enter");
    assert.equal(groups().length, 0);
    assert.equal(chosen.length, 3);
    key("Escape");
    assert.equal(input().props.value, "صنف");
    assert.equal(input().props["aria-expanded"], false);
    props.eligibleInactiveItemIds = ["inactive"];
    input().props.onFocus({ currentTarget: { select() {} } });
    assert.equal(options().length, 4, "original inactive items remain available after switching away");
    props.eligibleInactiveItemIds = [];
    props.value = "inactive";
    input().props.onFocus({ currentTarget: { select() {} } });
    assert.equal(options().length, 4, "the existing inactive item remains selectable during editing");
  } finally { overrides.delete("react"); overrides.delete("next-intl"); cache.delete(file); }
});

test("purchase free rows show one amount and note while physical rows retain quantity and dimensions", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  try {
    const { PurchaseLineRow } = load("@/app/modules/purchases/components/purchase-line-row");
    const props = { line: { key: "one", itemId: "charge", quantity: "1", unitCost: "125.5", note: "Delivery", thicknessM: "", widthM: "", lengthM: "" },
      items: [{ id: "charge", name: "Delivery", category: { name: "Charges" }, isActive: true, pricingMode: "free_amount" }],
      lineTotal: 125.5, canRemove: true, onSelectItem() {}, onChange() {}, onDuplicate() {}, onRemove() {}, onAddDimensionDefault: async () => {} };
    const free = renderToStaticMarkup(React.createElement(PurchaseLineRow, props));
    assert.match(free, /fieldAmount/);
    assert.match(free, /name="note-one"/);
    assert.doesNotMatch(free, /fieldQty|fieldUnitCost|fieldThickness|fieldWidth|fieldLength/);
    const physical = renderToStaticMarkup(React.createElement(PurchaseLineRow, { ...props, items: [{ ...props.items[0], pricingMode: "per_piece" }] }));
    for (const label of ["fieldQty", "fieldUnitCost", "fieldThickness", "fieldWidth", "fieldLength"]) assert.ok(physical.includes(label));
  } finally { overrides.delete("next-intl"); }
});

test("signed balances accept credit without relaxing payment validation", () => {
  const { isMoneyAmount, isSignedMoneyAmount } = load("@/app/modules/shared/utils/money-validation");
  for (const amount of [0, 500, -500, 12.34, -12.34]) assert.equal(isSignedMoneyAmount(amount), true);
  for (const amount of [NaN, Infinity, -Infinity, 1.001, -1.001]) assert.equal(isSignedMoneyAmount(amount), false);
  assert.equal(isMoneyAmount(-500), false);
});

test("account details show three lifetime metrics and identify credit ownership", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  const { createTranslator } = nativeRequire("next-intl");
  let locale = "en";
  overrides.set("next-intl", {
    useLocale: () => locale,
    useTranslations: (namespace) => createTranslator({ locale, namespace,
      messages: JSON.parse(readFileSync(resolve(root, `messages/${locale}.json`), "utf8")) }),
  });
  const path = resolve(root, "app/modules/shared/components/account-financial-summary.tsx");
  cache.delete(path);
  try {
    const { AccountFinancialSummary } = load("@/app/modules/shared/components/account-financial-summary");
    for (locale of ["en", "ar"]) {
      for (const party of ["customer", "supplier"]) {
        const html = renderToStaticMarkup(React.createElement(AccountFinancialSummary, {
          totalInvoiced: 1000, totalPaid: 1500, currentBalance: -500, party, currency: "EGP",
        }));
        const labels = JSON.parse(readFileSync(resolve(root, `messages/${locale}.json`), "utf8")).accountDetails;
        assert.equal((html.match(/<dt /g) ?? []).length, 3);
        assert.ok(html.includes(labels[party === "customer" ? "customerCredit" : "supplierCredit"]));
        assert.doesNotMatch(html, /openingBalance|Opening balance/);
        assert.match(html, /1,000/);
        assert.match(html, /1,500/);
      }
    }
  } finally { overrides.delete("next-intl"); cache.delete(path); }
});

test("list and detail account edits save actual balance and omit unchanged values", async () => {
  const states = [], dependencies = [], pending = [];
  let cursor = 0, runEffects = false;
  overrides.set("react", {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
    useCallback: (fn) => fn,
    useEffect(fn, deps) {
      const index = cursor++;
      if (runEffects && (!dependencies[index] || deps.some((value, i) => dependencies[index][i] !== value))) {
        dependencies[index] = deps;
        pending.push(fn);
      }
    },
  });
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  overrides.set("@/lib/api/use-api-error-message", { useApiErrorMessage: () => (error) => error.message });
  try {
    for (const party of ["customer", "supplier"]) {
      const plural = party === "customer" ? "customers" : "suppliers";
      const capitalized = party === "customer" ? "Customer" : "Supplier";
      const field = party === "customer" ? "balance" : "amountOwed";
      const setField = party === "customer" ? "setFormBalance" : "setFormAmountOwed";
      const formField = party === "customer" ? "formBalance" : "formAmountOwed";
      const account = { id: "account", name: "Account", phone: null, address: null, [field]: 750, isActive: true };
      const captures = [];
      const servicePath = `@/app/modules/${plural}/services/${plural}.service`;
      overrides.set(servicePath, {
        [`get${capitalized}`]: async () => account,
        [`update${capitalized}`]: async (id, input) => { captures.push(JSON.parse(JSON.stringify(input))); return { ...account, ...JSON.parse(JSON.stringify(input)), id }; },
        [`create${capitalized}`]: async (input) => { captures.push(JSON.parse(JSON.stringify(input))); return { ...account, ...input }; },
      });
      try {
        for (const surface of ["list", "detail"]) {
          states.length = 0; dependencies.length = 0; pending.length = 0; captures.length = 0;
          runEffects = surface === "detail";
          const hookName = surface === "detail" ? `use${capitalized}Detail` : party === "customer" ? "useCustomers" : "useSuppliers";
          const file = `app/modules/${plural}/hooks/use-${surface === "detail" ? `${party}-detail` : plural}.ts`;
          cache.delete(resolve(root, file));
          const hook = load(`@/${file}`)[hookName];
          const render = () => { cursor = 0; return hook(surface === "detail" ? "account" : undefined); };
          let state = render();
          for (const effect of pending.splice(0)) effect();
          await Promise.resolve(); await Promise.resolve();
          state = render(); runEffects = false;
          state.openEdit(account); state = render();
          assert.equal(state[formField], "750");
          state.setFormName("Changed contact"); state = render(); await state.submitForm();
          assert.equal(Object.hasOwn(captures.at(-1), field), false);
          for (const amount of ["100.25", "-50.75", "0"]) {
            state = render(); state.openEdit(account); state = render();
            state[setField](amount); state = render(); await state.submitForm();
            assert.equal(captures.at(-1)[field], Number(amount));
            assert.equal(Object.hasOwn(captures.at(-1), "openingBalance"), false);
          }
          state = render(); state.openEdit(account); state = render();
          const beforeInvalid = captures.length;
          for (const amount of ["", "1.001", "-1.001", "Infinity", "NaN"]) {
            state[setField](amount); state = render(); await state.submitForm();
            assert.equal(captures.length, beforeInvalid);
          }
          if (surface === "list") {
            state.openCreate(); state = render(); state.setFormName("New account"); state = render(); await state.submitForm();
            assert.equal(Object.hasOwn(captures.at(-1), field), false);
            state = render(); state.openCreate(); state = render(); state.setFormName("Credit account");
            state[setField]("-20.50"); state = render(); await state.submitForm();
            assert.equal(captures.at(-1)[field], -20.5);
          }
          cache.delete(resolve(root, file));
        }
      } finally { overrides.delete(servicePath); }
    }
  } finally {
    overrides.delete("react"); overrides.delete("next-intl"); overrides.delete("@/lib/api/use-api-error-message");
  }
});

const root = resolve(import.meta.dirname, "..");
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
const overrides = new Map();

test("item forms create and edit all pricing modes without codes or an extra catalog fetch", async () => {
  const cachedBefore = new Set(cache.keys());
  const states = [], effects = [], pending = [], creates = [], updates = [], catalogRequests = [], priceChanges = [];
  let cursor = 0, mode = "per_piece";
  const category = { id: "wood", name: "Wood", isActive: true, isDeleted: false };
  const item = () => ({ id: "item", name: "Board", category, pricingMode: mode, unitPrice: 10, cost: 5, stockQuantity: 2, reorderThreshold: 0, isActive: true, dimensionDefaults: { thickness: [], width: [], length: [] } });
  overrides.set("react", {
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial; return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }]; },
    useCallback: (fn) => fn,
    useEffect(fn, deps) { const index = cursor++; if (!effects[index] || deps.some((value, i) => effects[index][i] !== value)) { effects[index] = deps; pending.push(fn); } },
  });
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  overrides.set("@/lib/api/use-api-error-message", { useApiErrorMessage: () => (error) => error.message });
  overrides.set("@/app/modules/items/services/categories.service", { listCategories: async () => [category] });
  overrides.set("@/app/modules/items/services/items.service", {
    listItems: async () => { catalogRequests.push(true); return []; },
    getItem: async () => item(), createItem: async (input) => { creates.push(input); return item(); },
    updateItem: async (id, input) => { updates.push({ id, input }); return item(); }, updatePricing: async () => priceChanges.push(true),
  });
  const file = resolve(root, "app/modules/items/hooks/use-item-form.ts");
  cache.delete(file);
  try {
    const { useItemForm: runItemForm } = load("@/app/modules/items/hooks/use-item-form");
    for (mode of ["per_piece", "per_cubic_meter", "free_amount"]) {
      for (const editing of [false, true]) {
        states.length = 0; effects.length = 0; pending.length = 0;
        const render = () => { cursor = 0; return runItemForm(editing ? "item" : undefined); };
        let state = render();
        for (const effect of pending.splice(0)) effect();
        await Promise.resolve(); await Promise.resolve(); state = render();
        assert.equal(Object.hasOwn(state.values, "code"), false);
        assert.equal(Object.hasOwn(state, "codeIsManual"), false);
        state.setField("name", "Renamed board"); state.setField("categoryId", "wood");
        if (!editing) state.setField("pricingMode", mode);
        state = render(); assert.equal(await state.submit(), true);
        const payload = editing ? updates.at(-1).input : creates.at(-1);
        assert.equal(payload.name, "Renamed board"); assert.equal(Object.hasOwn(payload, "code"), false);
        if (!editing) assert.equal(payload.pricingMode, mode);
        if (mode === "free_amount") for (const field of ["cost", "unitPrice", "stockQuantity", "dimensionDefaults"]) assert.equal(Object.hasOwn(payload, field), false);
      }
    }
    assert.equal(creates.length, 3); assert.equal(updates.length, 3);
    assert.equal(catalogRequests.length, 0); assert.equal(priceChanges.length, 0);
  } finally {
    for (const key of ["react", "next-intl", "@/lib/api/use-api-error-message", "@/app/modules/items/services/items.service", "@/app/modules/items/services/categories.service"]) overrides.delete(key);
    for (const key of cache.keys()) if (!cachedBefore.has(key)) cache.delete(key);
  }
});

test("items KPI counts the complete non-deleted catalog independently of filters and refreshes after changes", async () => {
  const states = [], effects = [], pending = [];
  const cachedBefore = new Set(cache.keys());
  let cursor = 0;
  const file = resolve(root, "app/modules/items/hooks/use-items-page.ts");
  const category = { id: "wood", name: "Wood", isDeleted: false };
  let catalog = [
    { id: "active", name: "Active", code: "LEGACY-ONLY", category, isActive: true, isDeleted: false, pricingMode: "per_piece" },
    { id: "inactive", name: "Inactive", category, isActive: false, isDeleted: false, pricingMode: "per_piece" },
    { id: "service", name: "Service", category, isActive: true, isDeleted: false, pricingMode: "free_amount" },
    { id: "deleted", name: "Deleted", category, isActive: true, isDeleted: true },
  ];
  overrides.set("react", {
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial; return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }]; },
    useMemo: (fn) => fn(), useCallback: (fn) => fn,
    useEffect(fn, deps) { const index = cursor++; if (!effects[index] || deps.some((value, i) => effects[index][i] !== value)) { effects[index] = deps; pending.push(fn); } },
  });
  overrides.set("@/lib/api/use-api-error-message", { useApiErrorMessage: () => (error) => error.message });
  overrides.set("@/app/modules/items/services/items.service", { listItems: async () => catalog });
  overrides.set("@/app/modules/items/services/categories.service", { listCategories: async () => [category] });
  cache.delete(file);
  try {
    const { useItemsPage: runItemsHook } = load("@/app/modules/items/hooks/use-items-page");
    const render = () => { cursor = 0; return runItemsHook(); };
    const settle = async () => { for (const fn of pending.splice(0)) fn(); await Promise.resolve(); await Promise.resolve(); return render(); };
    let state = render(); state = await settle();
    assert.equal(state.status, "success"); assert.equal(state.totalItems, 3);
    state.setSearch("LEGACY-ONLY"); state = render(); assert.equal(state.groupedItems.length, 0);
    state.setSearch(""); state = render();
    state.setIsActive("inactive"); state = render();
    assert.equal(state.groupedItems.flatMap((group) => group.items).length, 1); assert.equal(state.totalItems, 3);
    state.setSearch("missing"); state = render();
    assert.equal(state.groupedItems.length, 0); assert.equal(state.totalItems, 3);
    state.setCategoryId("other"); state = render();
    assert.equal(state.totalItems, 3);
    catalog = catalog.filter((item) => item.id !== "inactive");
    state.refresh(); state = render(); state = await settle();
    assert.equal(state.totalItems, 2);
    catalog = []; state.refresh(); state = render(); state = await settle();
    assert.equal(state.status, "success"); assert.equal(state.totalItems, 0);
  } finally {
    for (const key of ["react", "@/lib/api/use-api-error-message", "@/app/modules/items/services/items.service", "@/app/modules/items/services/categories.service"]) overrides.delete(key);
    cache.delete(file); for (const key of cache.keys()) if (!cachedBefore.has(key)) cache.delete(key);
  }
});

test("catalog pagination keeps complete item groups, resets filters and refresh, and paginates categories without changing totals", async () => {
  const cachedBefore = new Set(cache.keys());
  const states = [], effects = [], pending = [];
  let cursor = 0;
  const categories = Array.from({ length: 12 }, (_, index) => ({ id: `cat-${index}`, name: `Category ${String(index).padStart(2, "0")}`, isActive: index !== 11, isDeleted: false }));
  let catalogCategories = categories;
  const items = categories.flatMap((category, index) => Array.from({ length: index === 0 ? 25 : 1 }, (_, row) => ({ id: `${category.id}-${row}`, name: `Item ${row}`, category, isActive: index !== 11, isDeleted: false })));
  overrides.set("react", {
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial; return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }]; },
    useMemo: (fn) => fn(), useCallback: (fn) => fn,
    useEffect(fn, deps) { const index = cursor++; if (!effects[index] || deps.some((value, i) => effects[index][i] !== value)) { effects[index] = deps; pending.push(fn); } },
  });
  overrides.set("@/lib/api/use-api-error-message", { useApiErrorMessage: () => (error) => error.message });
  overrides.set("@/app/modules/items/services/categories.service", { listCategories: async () => catalogCategories });
  overrides.set("@/app/modules/items/services/items.service", { listItems: async () => items });
  try {
    for (const kind of ["items-page", "categories"]) {
      states.length = 0; effects.length = 0; pending.length = 0;
      const file = resolve(root, `app/modules/items/hooks/use-${kind}.ts`);
      cache.delete(file);
      const hook = load(`@/app/modules/items/hooks/use-${kind}`)[kind === "items-page" ? "useItemsPage" : "useCategories"];
      const render = () => { cursor = 0; return hook(); };
      const settle = async () => { for (const effect of pending.splice(0)) effect(); await Promise.resolve(); await Promise.resolve(); return render(); };
      let state = render(); state = await settle();
      if (kind === "items-page") {
        assert.equal(state.totalPages, 3); assert.equal(state.page, 1);
        assert.equal(state.groupedItems.length, 5); assert.equal(state.groupedItems[0].items.length, 25);
        assert.equal(state.totalItems, 36);
        state.setPage(3); state = render(); assert.equal(state.groupedItems.length, 2);
        state.setIsActive("inactive"); state = render(); assert.equal(state.page, 1); assert.equal(state.totalPages, 1); assert.equal(state.totalItems, 36);
        state.setIsActive("all"); state = render(); state.setPage(2); state = render();
        state.setSearch("missing"); state = render(); assert.equal(state.page, 1); assert.equal(state.groupedItems.length, 0);
        state.setSearch(""); state = render(); state.setPage(2); state = render();
        state.setCategoryId("cat-0"); state = render(); assert.equal(state.page, 1); assert.equal(state.groupedItems[0].items.length, 25);
        state.setCategoryId(""); state = render(); state.setPage(3); state = render();
      } else {
        assert.equal(state.categories.length, 12); assert.equal(state.pageCategories.length, 10); assert.equal(state.totalPages, 2);
        state.setPage(2); state = render(); assert.equal(state.pageCategories.length, 2); assert.equal(state.pageCategories[0].id, "cat-10");
        state.setSearch("  CATEGORY 01  "); state = render();
        assert.equal(state.page, 1); assert.equal(state.totalPages, 1); assert.equal(state.pageCategories[0].id, "cat-1"); assert.equal(state.categories.length, 12);
        state.setIsActive("inactive"); state = render(); assert.equal(state.pageCategories.length, 0); assert.equal(state.hasFilters, true);
        state.setSearch(""); state = render(); assert.equal(state.pageCategories[0].id, "cat-11");
        state.setIsActive("active"); state = render(); assert.equal(state.totalPages, 2);
        state.setPage(2); state = render(); assert.equal(state.pageCategories.length, 1);
        state.setIsActive("all"); state = render(); assert.equal(state.page, 1); assert.equal(state.hasFilters, false);
        state.setPage(2); state = render(); state.setSearch("missing"); state = render();
        assert.equal(state.page, 1); assert.equal(state.totalPages, 1); assert.equal(state.pageCategories.length, 0); assert.equal(state.categories.length, 12);
        catalogCategories = []; state.refresh(); state = render(); state = await settle();
        assert.equal(state.page, 1); assert.equal(state.totalPages, 1); assert.equal(state.pageCategories.length, 0);
      }
      state.refresh(); state = render(); state = await settle(); assert.equal(state.page, 1);
    }
  } finally {
    for (const key of ["react", "@/lib/api/use-api-error-message", "@/app/modules/items/services/items.service", "@/app/modules/items/services/categories.service"]) overrides.delete(key);
    for (const key of cache.keys()) if (!cachedBefore.has(key)) cache.delete(key);
  }
});

test("category toolbar exposes name and status filters and filtered empty state gives filter guidance", () => {
  const cachedBefore = new Set(cache.keys());
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  try {
    const { CategoriesToolbar } = load("@/app/modules/items/components/categories-toolbar");
    const { CategoriesList } = load("@/app/modules/items/components/categories-list");
    const nodes = (element) => !element || typeof element !== "object" ? [] : [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
    const changes = [];
    const tree = CategoriesToolbar({ filters: { search: "Wood", isActive: "active" }, onSearchChange: (value) => changes.push(value), onActiveChange: (value) => changes.push(value) });
    const input = nodes(tree).find((node) => node.type === "input");
    const select = nodes(tree).find((node) => node.type === "select");
    assert.equal(input.props.value, "Wood"); assert.equal(input.props.placeholder, "searchPlaceholder");
    input.props.onChange({ target: { value: "MDF" } }); select.props.onChange({ target: { value: "inactive" } });
    assert.deepEqual(changes, ["MDF", "inactive"]);
    assert.deepEqual(nodes(select).filter((node) => node.type === "option").map((node) => node.props.value), ["all", "active", "inactive"]);
    const props = { categories: [], status: "success", error: null };
    assert.equal(CategoriesList(props).props.title, "emptyTitle");
    const empty = CategoriesList({ ...props, hasFilters: true });
    assert.equal(empty.props.title, "noResultsTitle"); assert.equal(empty.props.description, "noResultsDescription");
  } finally {
    overrides.delete("next-intl");
    for (const key of cache.keys()) if (!cachedBefore.has(key)) cache.delete(key);
  }
});

test("catalog pagination controls show localized counters and disable page boundaries", () => {
  const cachedBefore = new Set(cache.keys());
  overrides.set("next-intl", { useTranslations: () => (key, values) => key === "pageOf" ? `Page ${values.page} of ${values.totalPages}` : key });
  try {
    const { CatalogPagination } = load("@/app/modules/items/components/catalog-pagination");
    const changes = [];
    const props = { page: 1, totalPages: 3, onPageChange: (page) => changes.push(page) };
    assert.equal(CatalogPagination({ ...props, totalPages: 1 }), null);
    let tree = CatalogPagination(props);
    assert.equal(tree.type, "nav"); assert.equal(tree.props["aria-label"], "pagination");
    let [previous, counter, next] = tree.props.children;
    assert.equal(previous.props.disabled, true); assert.equal(next.props.disabled, false);
    assert.equal(counter.props.children, "Page 1 of 3");
    next.props.onClick(); assert.deepEqual(changes, [2]);
    tree = CatalogPagination({ ...props, page: 3 });
    [previous, counter, next] = tree.props.children;
    assert.equal(previous.props.disabled, false); assert.equal(next.props.disabled, true);
    assert.equal(counter.props.children, "Page 3 of 3");
    previous.props.onClick(); assert.deepEqual(changes, [2, 2]);
  } finally {
    overrides.delete("next-intl");
    for (const key of cache.keys()) if (!cachedBefore.has(key)) cache.delete(key);
  }
});

test("item category headers expose collapse controls and both pages share the styled toggle", () => {
  const cachedBefore = new Set(cache.keys());
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  try {
    const { CategoryItemsTable } = load("@/app/modules/items/components/category-items-table");
    const { CategoryToggleButton } = load("@/app/modules/shared/components/category-toggle-button");
    const nodes = (element) => !element || typeof element !== "object" ? [] : [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
    let toggles = 0;
    const props = { category: { id: "wood", name: "Wood" }, items: [], isCollapsed: false, onToggle: () => toggles++, onEdit() {}, onDelete() {}, onHistory() {} };
    let tree = CategoryItemsTable(props);
    let header = nodes(tree).find((node) => node.type === "button");
    assert.equal(header.props["aria-expanded"], true); assert.equal(header.props["aria-controls"], "items-category-wood");
    assert.equal(nodes(tree).find((node) => node.props.id === "items-category-wood").props.hidden, false);
    header.props.onClick(); assert.equal(toggles, 1);
    tree = CategoryItemsTable({ ...props, isCollapsed: true });
    header = nodes(tree).find((node) => node.type === "button");
    assert.equal(header.props["aria-expanded"], false);
    assert.equal(nodes(tree).find((node) => node.props.id === "items-category-wood").props.hidden, true);
    for (const allCollapsed of [true, false]) {
      const toggle = CategoryToggleButton({ allCollapsed, onClick: props.onToggle });
      assert.equal(toggle.props.variant, "secondary"); assert.match(toggle.props.className, /min-h-11/);
      assert.equal(toggle.props.children.at(-1), allCollapsed ? "expandAll" : "collapseAll");
    }
  } finally {
    overrides.delete("next-intl");
    for (const key of cache.keys()) if (!cachedBefore.has(key)) cache.delete(key);
  }
});

test("shared category collapse keeps the global choice across item pages, filters and individual overrides", () => {
  const states = [];
  const cachedBefore = new Set(cache.keys());
  let cursor = 0;
  overrides.set("react", { useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial; return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }]; } });
  try {
    const { useCategoryCollapse: runCategoryCollapse } = load("@/app/modules/shared/hooks/use-category-collapse");
    let ids = ["A", "B"];
    const render = () => { cursor = 0; return runCategoryCollapse(ids); };
    let state = render(); assert.equal(state.allCollapsed, false);
    state.toggleAll(); state = render(); assert.equal(state.allCollapsed, true);
    ids = ["C", "D"]; state = render(); assert.equal(state.allCollapsed, true);
    state.toggleCategory("C"); state = render(); assert.equal(state.isCategoryCollapsed("C"), false); assert.equal(state.isCategoryCollapsed("D"), true);
    ids = []; state = render(); assert.equal(state.allCollapsed, false);
    ids = ["A", "B"]; state = render(); assert.equal(state.allCollapsed, true);
    state.toggleAll(); state = render(); assert.equal(state.allCollapsed, false);
    ids = ["C", "D"]; state = render(); assert.equal(state.isCategoryCollapsed("C"), false); assert.equal(state.isCategoryCollapsed("D"), false);
    state.toggleCategory("D"); state = render(); assert.equal(state.isCategoryCollapsed("D"), true);
    state.toggleAll(); ids = ["E"]; state = render(); assert.equal(state.allCollapsed, true);
  } finally {
    overrides.delete("react");
    for (const key of cache.keys()) if (!cachedBefore.has(key)) cache.delete(key);
  }
});

test("inventory collapse all and expand all apply across pages with individual overrides", () => {
  const states = [];
  const cachedBefore = new Set(cache.keys());
  let cursor = 0;
  const file = resolve(root, "app/modules/inventory/components/stock-table.tsx");
  overrides.set("react", {
    useMemo: (fn) => fn(),
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
  });
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  cache.delete(file);
  const item = (id) => ({ id, name: id, categoryId: id, category: { id, name: id }, pricingMode: "per_piece", stockQuantity: 1, cost: 1, unitPrice: 2, valuationAtCost: 1, valuationAtSellingPrice: 2, reorderThreshold: 0, isActive: true });
  const props = { items: [item("A"), item("B")], isLoading: false, page: 1, totalPages: 3, totalCategories: 5, onPageChange() {}, onAdjustStock() {}, onUpdateThreshold() {}, onViewAdjustmentsForItem() {} };
  try {
    const { StockTable } = load("@/app/modules/inventory/components/stock-table");
    const render = () => { cursor = 0; return StockTable(props); };
    const nodes = (element) => !element || typeof element !== "object" ? [] : [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
    const headers = () => nodes(render()).filter((node) => node.type === "button" && typeof node.props["aria-expanded"] === "boolean");
    const expanded = () => headers().map((node) => node.props["aria-expanded"]);
    const allButton = () => nodes(render()).find((node) => typeof node.props?.allCollapsed === "boolean" && typeof node.props?.onClick === "function");
    assert.deepEqual(expanded(), [true, true]);
    allButton().props.onClick();
    assert.deepEqual(expanded(), [false, false]);
    props.page = 2; props.items = [item("C"), item("D")]; props.isLoading = true; render(); props.isLoading = false;
    assert.deepEqual(expanded(), [false, false]);
    assert.equal(allButton().props.allCollapsed, true);
    headers()[0].props.onClick();
    assert.deepEqual(expanded(), [true, false]);
    props.page = 1; props.items = [item("A"), item("B")];
    assert.deepEqual(expanded(), [false, false]);
    props.page = 2; props.items = [item("C"), item("D")];
    assert.deepEqual(expanded(), [true, false]);
    allButton().props.onClick();
    assert.deepEqual(expanded(), [false, false]);
    allButton().props.onClick();
    assert.deepEqual(expanded(), [true, true]);
    props.page = 1; props.items = [item("A"), item("B")];
    assert.deepEqual(expanded(), [true, true]);
    headers()[0].props.onClick();
    assert.deepEqual(expanded(), [false, true]);
    props.page = 3; props.items = [item("E")];
    assert.deepEqual(expanded(), [true]);
    allButton().props.onClick();
    props.page = 1; props.items = [item("A"), item("B")];
    assert.deepEqual(expanded(), [false, false]);
  } finally {
    overrides.delete("react"); overrides.delete("next-intl"); cache.delete(file);
    for (const key of cache.keys()) if (!cachedBefore.has(key)) cache.delete(key);
  }
});

test("inventory service serializes category pagination without changing legacy requests", async () => {
  const requests = [];
  const file = resolve(root, "app/modules/inventory/services/inventory.service.ts");
  overrides.set("@/lib/api/client", { apiClient: { get: async (url, options) => { requests.push({ url, options }); return {}; } } });
  cache.delete(file);
  try {
    const { getStockList } = load("@/app/modules/inventory/services/inventory.service");
    const signal = new AbortController().signal;
    await getStockList({ paginationMode: "categories", page: 2, limit: 5, categoryId: "wood", stockStatus: "low_stock", q: " oak " }, signal);
    const query = new URL(requests[0].url, "http://localhost").searchParams;
    assert.deepEqual(Object.fromEntries(query), { categoryId: "wood", stockStatus: "low_stock", q: "oak", page: "2", limit: "5", paginationMode: "categories" });
    assert.equal(requests[0].options.signal, signal);
    await getStockList({ page: 1, limit: 25 });
    assert.equal(requests[1].url, "/inventory/stock?page=1&limit=25");
    await getStockList();
    assert.equal(requests[2].url, "/inventory/stock");
  } finally { overrides.delete("@/lib/api/client"); cache.delete(file); }
});

test("inventory hook requests five complete categories and resets all filters to page one", async () => {
  const states = [], dependencies = [], pending = [], requests = [], timers = new Map();
  const cleanups = new Map();
  let cursor = 0, timerId = 0, deferredResponse;
  let responseMeta = { page: 1, limit: 5, total: 11, totalItems: 200, paginationMode: "categories", totalPages: 4 };
  const file = resolve(root, "app/modules/inventory/hooks/use-inventory.ts");
  const servicePath = "@/app/modules/inventory/services/inventory.service";
  const categoriesPath = "@/app/modules/items/services/categories.service";
  const oldWindow = globalThis.window;
  globalThis.window = { setTimeout(fn) { timers.set(++timerId, fn); return timerId; }, clearTimeout(id) { timers.delete(id); } };
  overrides.set("react", {
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial; return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }]; },
    useCallback: (fn) => fn,
    useEffect(fn, deps) { const index = cursor++; if (!dependencies[index] || deps.some((value, i) => dependencies[index][i] !== value)) { dependencies[index] = deps; pending.push(() => { cleanups.get(index)?.(); cleanups.set(index, fn()); }); } },
  });
  overrides.set("@/lib/api/use-api-error-message", { useApiErrorMessage: () => (error) => error.message });
  overrides.set(servicePath, {
    getStockList: async (filters) => { requests.push(filters); if (deferredResponse) { const response = deferredResponse; deferredResponse = undefined; return response; } return { items: [{ id: "entire-category" }], meta: responseMeta, summary: { totalItems: 200 } }; },
    getInventoryValuation: async () => ({ totalItemsCount: 200 }),
  });
  overrides.set(categoriesPath, { listCategories: async () => [] });
  cache.delete(file);
  try {
    const { useInventory: runInventoryHook } = load("@/app/modules/inventory/hooks/use-inventory");
    const render = () => { cursor = 0; return runInventoryHook(); };
    const settle = async () => { for (const effect of pending.splice(0)) effect(); await Promise.resolve(); await Promise.resolve(); return render(); };
    let state = render();
    assert.equal(state.meta.paginationMode, "categories");
    assert.equal(state.meta.limit, 5);
    state = await settle();
    for (const timer of timers.values()) timer(); timers.clear();
    assert.deepEqual(requests[0], { page: 1, limit: 5, paginationMode: "categories" });
    assert.equal(state.totalPages, 4);
    assert.equal(state.meta.total, 11);
    assert.equal(state.summary.totalItems, 200);
    assert.equal(state.items[0].id, "entire-category");
    state.setPage(2); state = render(); state = await settle();
    assert.equal(requests.at(-1).page, 2);
    state.setCategoryId("oak"); state = render(); state = await settle();
    assert.equal(requests.at(-1).page, 1);
    assert.equal(requests.at(-1).categoryId, "oak");
    state.setPage(2); state = render(); state = await settle();
    state.setStatusFilter("low_stock"); state = render(); state = await settle();
    assert.equal(requests.at(-1).page, 1);
    assert.equal(requests.at(-1).stockStatus, "low_stock");
    state.setPage(2); state = render(); state = await settle();
    state.setSearchInput(" pine "); state = render(); state = await settle();
    for (const timer of timers.values()) timer(); timers.clear();
    state = render(); state = await settle();
    assert.equal(requests.at(-1).page, 1);
    assert.equal(requests.at(-1).q, "pine");
    responseMeta = { page: 1, limit: 2, total: 11, totalItems: 200, paginationMode: "categories" };
    state.refresh(); state = render(); state = await settle();
    assert.equal(state.totalPages, 6);
    state.setPage(6); state = render(); state = await settle();
    responseMeta = { ...responseMeta, total: 0, totalPages: 1 };
    state.refresh(); state = render(); state = await settle();
    assert.equal(state.totalPages, 1);
    assert.equal(state.page, 1);
    state = await settle();
    assert.equal(requests.at(-1).page, 1);
    let releaseOldResponse;
    deferredResponse = new Promise((resolveResponse) => { releaseOldResponse = resolveResponse; });
    state.setCategoryId("stale"); state = render(); state = await settle();
    state.setCategoryId("current"); state = render(); state = await settle();
    releaseOldResponse({ items: [{ id: "stale-item" }], meta: { ...responseMeta, total: 99 }, summary: { totalItems: 999 } });
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    state = render();
    assert.equal(state.meta.total, 0);
    assert.equal(state.summary.totalItems, 200);
    assert.equal(state.items[0].id, "entire-category");
  } finally {
    for (const cleanup of cleanups.values()) cleanup?.();
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    for (const key of ["react", "next-intl", "@/lib/api/use-api-error-message", servicePath, categoriesPath]) overrides.delete(key);
    cache.delete(file);
  }
});

test("inventory stock table renders category counts and pages using both real locale dictionaries", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  const { createTranslator } = nativeRequire("next-intl");
  const file = resolve(root, "app/modules/inventory/components/stock-table.tsx");
  for (const locale of ["en", "ar"]) {
    const messages = JSON.parse(readFileSync(resolve(root, `messages/${locale}.json`), "utf8"));
    const translate = (namespace) => createTranslator({ locale, messages, namespace, onError(error) { throw error; } });
    overrides.set("next-intl", { useLocale: () => locale, useTranslations: translate });
    cache.delete(file);
    try {
      const { StockTable } = load("@/app/modules/inventory/components/stock-table");
      const items = ["Zebra", "Alpha"].map((name) => ({ id: name, name, category: { id: name, name }, pricingMode: "per_piece", stockQuantity: 1, reorderThreshold: 0, cost: 1, unitPrice: 2, valuationAtCost: 1 }));
      const html = renderToStaticMarkup(React.createElement(StockTable, { items, isLoading: false, page: 2, totalPages: 3, totalCategories: 11, onPageChange() {}, onAdjustStock() {}, onUpdateThreshold() {}, onViewAdjustmentsForItem() {} }));
      assert.ok(html.includes(translate("inventory")("categoryCount", { count: 2, total: 11 })));
      assert.ok(html.includes(translate("inventory")("categoryPageOf", { page: 2, totalPages: 3 })));
      assert.ok(html.indexOf("Zebra") < html.indexOf("Alpha"));
      assert.doesNotMatch(html, /\{(?:count|total|page|totalPages)\}|inventory\.category/);
      const edgeItems = [
        { ...items[0], id: "tie-last", name: "Tie Last", category: { id: "b", name: "Same" } },
        { ...items[0], id: "tie-first", name: "Tie First", category: { id: "a", name: "Same" } },
        { ...items[0], id: "orphan-one", category: null, categoryId: "missing-one" },
        { ...items[0], id: "orphan-two", category: null, categoryId: "missing-two" },
      ];
      const edgeHtml = renderToStaticMarkup(React.createElement(StockTable, { items: edgeItems, isLoading: false, page: 1, totalPages: 1, totalCategories: 4, onPageChange() {}, onAdjustStock() {}, onUpdateThreshold() {}, onViewAdjustmentsForItem() {} }));
      assert.ok(edgeHtml.includes(translate("inventory")("categoryCount", { count: 4, total: 4 })));
      assert.ok(edgeHtml.indexOf("Tie Last") < edgeHtml.indexOf("Tie First"));
      assert.ok(edgeHtml.indexOf("Tie Last") < edgeHtml.indexOf(translate("inventory")("uncategorized")));
    } finally { overrides.delete("next-intl"); cache.delete(file); }
  }
});

test("account payment previews preserve signed credit and exclude replaced invoice debt", () => {
  const { accountBalanceAfterInvoice, parseAccountPayment, splitInvoicePayment, invoicePaymentBreakdown } = load("@/app/modules/shared/utils/account-payment");
  assert.deepEqual(invoicePaymentBreakdown(1000, 3000), { invoicePaid: 1000, accountPaymentAmount: 3000, totalPaid: 4000 });
  assert.deepEqual(invoicePaymentBreakdown(1000), { invoicePaid: 1000, accountPaymentAmount: 0, totalPaid: 1000 });
  assert.deepEqual(splitInvoicePayment(2000, 1000), { paid: 1000, accountPaymentAmount: 1000, remaining: 0 });
  assert.deepEqual(splitInvoicePayment(250, 1000), { paid: 250, accountPaymentAmount: 0, remaining: 750 });
  assert.deepEqual(splitInvoicePayment(0.3, 0.2), { paid: 0.2, accountPaymentAmount: 0.1, remaining: 0 });
  assert.equal(accountBalanceAfterInvoice(500, 0, 1000), -500);
  assert.equal(accountBalanceAfterInvoice(-500, 1000, 0), 500);
  assert.equal(accountBalanceAfterInvoice(700, 250, 100, 200), 650);
  assert.equal(accountBalanceAfterInvoice(500, 800, 1000), 300);
  assert.equal(parseAccountPayment(""), 0);
  assert.equal(parseAccountPayment("1000.25"), 1000.25);
  for (const raw of ["-1", "Infinity", "NaN", "1.001", "abc"]) assert.equal(parseAccountPayment(raw), null);
});

test("sales and purchase totals use one paid field and explain automatic excess", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key, values) => key === "excessPaymentNotice" ? `${key}: ${values.amount}` : key });
  try {
    const { PurchaseTotals } = load("@/app/modules/purchases/components/purchase-totals");
    const { InvoiceTotals } = load("@/app/modules/invoices/components/invoice-totals");
    const additional = { additionalAmount: 1000, accountBalance: -500 };
    const purchase = renderToStaticMarkup(React.createElement(PurchaseTotals, {
      total: 1000, paidInput: "2000", onPaidChange() {}, remaining: 0,
      supplierBalance: 500, ...additional,
    }));
    const sales = renderToStaticMarkup(React.createElement(InvoiceTotals, {
      total: 1000, remaining: 0, discountInput: "0", paidInput: "2000", onDiscountChange() {}, onPaidChange() {}, ...additional,
    }));
    assert.ok(sales.indexOf('name="paid"') < sales.indexOf('name="discount"'));
    for (const html of [purchase, sales]) {
      const paidInput = html.match(/<input[^>]*name="paid"[^>]*>/)?.[0];
      assert.ok(paidInput);
      assert.doesNotMatch(paidInput, /\smax=/);
      assert.doesNotMatch(html, /name="accountPaymentAmount"/);
      assert.match(html, /previousDebtPayment/);
      assert.match(html, /1,000/);
      assert.match(html, /500/);
    }
    const cash = renderToStaticMarkup(React.createElement(InvoiceTotals, {
      total: 1000, remaining: 0, discountInput: "0", paidInput: "1000", onDiscountChange() {}, onPaidChange() {}, paidReadOnly: true, ...additional,
    }));
    assert.doesNotMatch(cash, /name="accountPaymentAmount"/);
  } finally { overrides.delete("next-intl"); }
});

test("invoice form submissions split overpayments and do not replay them on edit", async () => {
  const states = [], effects = [], pending = [];
  let cursor = 0;
  overrides.set("react", {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = { current: initial };
      return states[index];
    },
    useMemo: (fn) => fn(), useCallback: (fn) => fn,
    useEffect(fn, deps) {
      const index = cursor++;
      const before = effects[index];
      if (!before || deps.some((value, i) => before.deps[i] !== value)) {
        before?.cleanup?.();
        effects[index] = { deps };
        pending.push(() => { effects[index].cleanup = fn(); });
      }
    },
  });
  const item = { id: "wood", pricingMode: "per_piece", unitPrice: 1000, cost: 1000, isActive: true };
  const freeItem = { id: "charge", pricingMode: "free_amount", unitPrice: 0, cost: 999, isActive: true };
  const party = { id: "party", name: "Account", isActive: true, balance: 500, amountOwed: 500 };
  const captures = [];
  const service = {
    createSalesInvoice: async (input) => { captures.push(input); return { id: "saved" }; },
    updateSalesInvoice: async (id, input) => { captures.push(input); return { id }; },
    createPurchase: async (input) => { captures.push(input); return { id: "saved" }; },
    updatePurchase: async (id, input) => { captures.push(input); return { id }; },
  };
  const replacements = {
    "@/app/modules/items/hooks/use-item-dimension-defaults": { useItemDimensionDefaults: () => async () => {} },
    "@/lib/api/use-api-error-message": { useApiErrorMessage: () => (error) => error.message },
    "@/app/modules/items/services/items.service": { listItems: async () => [item, freeItem], getItem: async (id) => id === "charge" ? freeItem : item },
    "@/app/modules/customers/services/customers.service": { listCustomers: async () => ({ items: [party] }), getCustomer: async () => party },
    "@/app/modules/suppliers/services/suppliers.service": { listSuppliers: async () => ({ items: [party] }), getSupplier: async () => party },
    "@/app/modules/invoices/services/invoices.service": service,
    "@/app/modules/purchases/services/purchases.service": service,
  };
  for (const [key, value] of Object.entries(replacements)) overrides.set(key, value);
  try {
    for (const kind of ["sales", "purchase"]) {
      states.length = 0;
      effects.length = 0;
      pending.length = 0;
      const hook = kind === "sales"
        ? load("@/app/modules/invoices/hooks/use-invoice-form").useInvoiceForm
        : load("@/app/modules/purchases/hooks/use-purchase-form").usePurchaseForm;
      function render() {
        cursor = 0;
        const result = hook();
        while (pending.length) pending.shift()();
        return result;
      }
      let form = render();
      await new Promise((resolve) => setImmediate(resolve));
      form = render();
      if (kind === "sales") { assert.equal(form.type, "customer_sale"); form.selectCustomer(party); }
      else form.selectSupplier(party);
      form.updateLine(form.lines[0].key, kind === "sales"
        ? { itemId: "wood", quantity: "1", piecePrice: "1000" }
        : { itemId: "wood", quantity: "1", unitCost: "1000" });
      form.setPaidInput("2000");
      form = render();
      assert.equal(form.accountBalance, -500);
      assert.equal(await form.submit({ print: false, t: (key) => key }), "saved");
      assert.equal(captures.at(-1).paid, 1000);
      assert.equal(captures.at(-1).accountPaymentAmount, 1000);
      assert.equal(captures.at(-1).existingDebtPayment, undefined);
      const invoice = { id: "saved", invoiceNumber: "INV-1", type: "customer_sale", customerId: "party", supplierId: "party", paid: 1000, remaining: 0, total: 1000, discount: 0, lines: [{ itemId: "wood", quantity: 1, piecePrice: 1000, unitCost: 1000, lineTotal: 1000 }] };
      await form.initializeForEdit(invoice, party);
      form = render();
      assert.equal(form.paidInput, "1000");
      assert.equal(await form.submit({ print: false, t: (key) => key }), "saved");
      assert.equal(captures.at(-1).accountPaymentAmount, 0);
      form.setPaidInput("1500");
      form = render();
      const count = captures.length;
      assert.equal(await form.submit({ print: false, t: (key) => key }), "saved");
      assert.equal(captures.length, count + 1);
      assert.equal(captures.at(-1).paid, 1000);
      assert.equal(captures.at(-1).accountPaymentAmount, 500);
      form.setPaidInput("NaN");
      form = render();
      assert.equal(await form.submit({ print: false, t: (key) => key }), null);
      assert.equal(captures.length, count + 1);
      if (kind === "purchase") {
        const previousWindow = globalThis.window;
        globalThis.window = { setTimeout: () => 1, clearTimeout() {} };
        try {
          form.setSupplierQuery("different supplier");
          form = render();
          assert.equal(form.suppliersLoading, true, "the picker blocks selection throughout debounce");
          assert.deepEqual(form.supplierResults, []);
          form.setSupplierQuery("");
          form = render();
          assert.equal(form.suppliersLoading, false);
        } finally {
          if (previousWindow === undefined) delete globalThis.window;
          else globalThis.window = previousWindow;
        }
        form.resetForm();
        form = render();
        form.selectSupplier(party);
        form = render();
        const lineKey = form.lines[0].key;
        form.selectItem(lineKey, "charge");
        form = render();
        assert.equal(form.lines[0].unitCost, "", "free charges must not inherit catalog cost");
        assert.equal(form.lines[0].quantity, "1");
        form.updateLine(lineKey, { unitCost: "77.25" });
        form = render();
        form.selectItem(lineKey, "charge");
        form = render();
        assert.equal(form.lines[0].unitCost, "77.25", "reselecting a free item preserves its entered amount");
        form.updateLine(lineKey, { quantity: "99", unitCost: "125.56", thicknessM: "2", widthM: "3", lengthM: "4", note: "  delivery  " });
        form.setPaidInput("200");
        form = render();
        assert.equal(form.total, 125.56, "free charges ignore stock quantity and dimensions");
        assert.equal(await form.submit({ t: (key) => key }), "saved");
        assert.deepEqual(captures.at(-1).lines, [{ itemId: "charge", quantity: 1, unitCost: 125.56, thickness: undefined, width: undefined, length: undefined, note: "delivery" }]);
        assert.equal(captures.at(-1).paid, 125.56);
        assert.equal(captures.at(-1).accountPaymentAmount, 74.44);
        await form.initializeForEdit({ ...invoice, lines: [{ itemId: "charge", quantity: 1, unitCost: 125.56, lineTotal: 125.56, pricingModeSnapshot: "free_amount" }] });
        form = render();
        assert.equal(form.lines[0].unitCost, "125.56");
        assert.equal(await form.submit({ t: (key) => key }), "saved");
        assert.equal(captures.at(-1).lines[0].quantity, 1);
        const beforeInvalid = captures.length;
        for (const unitCost of ["0", "-1", "NaN", "Infinity", "0.001", "125.555"]) {
          form.updateLine(form.lines[0].key, { unitCost });
          form = render();
          assert.equal(await form.submit({ t: (key) => key }), null);
        }
        assert.equal(captures.length, beforeInvalid);
        form.selectItem(form.lines[0].key, "wood");
        form = render();
        assert.equal(form.lines[0].quantity, "1");
        assert.equal(form.lines[0].unitCost, "1000");
        assert.equal(form.lines[0].thicknessM, "");
      }
      form.resetForm();
      form = render();
      if (kind === "sales") assert.equal(form.type, "customer_sale");
    }
  } finally {
    for (const effect of effects) effect?.cleanup?.();
    overrides.delete("react");
    for (const key of Object.keys(replacements)) overrides.delete(key);
  }
});

test("printed receipt and invoice modal show total paid with a conditional previous-debt breakdown", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  overrides.set("next/image", { default: () => null });
  try {
    const { PublicInvoiceSheet } = load("@/app/modules/invoices/components/public-invoice-sheet");
    const { InvoicePreviewModal } = load("@/app/modules/invoices/components/invoice-preview-modal");
    const invoice = { id: "independent", invoiceNumber: "INV-0020", createdAt: "2026-10-21T12:00:00Z",
      type: "customer_sale", customerName: "Account", status: "saved", total: 1000, discount: 0,
      paid: 200, remaining: 800, accountPaymentAmount: 4321,
      lines: [{ itemId: "wood", itemLabel: "Wood", pricingModeSnapshot: "per_piece", quantity: 1, piecePrice: 1000, lineTotal: 1000, thickness: null, width: null, length: null, note: null }] };
    const rendered = [
      renderToStaticMarkup(React.createElement(PublicInvoiceSheet, { invoice })),
      renderToStaticMarkup(React.createElement(InvoicePreviewModal, { open: true, invoiceId: invoice.id, initialInvoice: invoice })),
    ];
    for (const html of rendered) {
      assert.match(html, /المدفوع:[\s\S]*?4,521/);
      assert.match(html, /200[\s\S]*?\+[\s\S]*?4,321/);
      assert.match(html, /مديونية سابقة/);
      assert.match(html, /المتبقي:[\s\S]*?>800<\/span>/);

    }
  } finally { overrides.delete("next-intl"); overrides.delete("next/image"); }
});

test("customer picker searches and selects in one field with keyboard navigation", () => {
  const state = [];
  let cursor = 0;
  const selected = [];
  const active = { id: "active", name: "Active", isActive: true };
  const another = { id: "another", name: "Another", isActive: true };
  const props = { name: "account", labels: { label: "Account", placeholder: "Search", clear: "Clear", loading: "Loading", empty: "No accounts" }, query: "", results: [another], loading: false, allAccounts: [active, another, { id: "off", name: "Inactive", isActive: false }],
    allAccountsLoading: false, selectedAccount: null,
    onQueryChange(value) { props.query = value; },
    onSelect(value) { selected.push(value.id); props.selectedAccount = value; },
    onClear() { props.selectedAccount = null; },
  };
  overrides.set("react", {
    useId: () => "customer-picker",
    useEffect() {},
    useRef(initial) { const index = cursor++; if (!(index in state)) state[index] = { current: initial }; return state[index]; },
    useState(initial) { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], (value) => { state[index] = value; }]; },
  });
  overrides.set("next-intl", { useTranslations: () => (key) => key });
  const path = resolve(root, "app/modules/shared/components/account-combobox.tsx");
  cache.delete(path);
  try {
    const { AccountCombobox } = load("@/app/modules/shared/components/account-combobox");
    function render() { cursor = 0; return AccountCombobox(props); }
    function nodes(element) {
      return !element || typeof element !== "object" ? [] : [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
    }
    const input = () => nodes(render()).find((node) => node.props?.role === "combobox");
    assert.equal(nodes(render()).filter((node) => node.type === "input").length, 1);
    input().props.onFocus({ currentTarget: {} });
    assert.equal(nodes(render()).filter((node) => node.props?.role === "option").length, 2);
    const key = (value) => input().props.onKeyDown({ key: value, preventDefault() {}, stopPropagation() {} });
    key("ArrowDown");
    key("ArrowDown");
    key("Enter");
    assert.deepEqual(selected, ["another"]);
    assert.equal(input().props.value, "Another");
    input().props.onFocus({ currentTarget: { select() {} } });
    key("Enter");
    assert.equal(selected.at(-1), "another", "Enter on the selected account must not switch to the first customer");
    input().props.onChange({ target: { value: "An" } });
    assert.equal(props.selectedAccount, null);
    assert.equal(input().props.value, "An");
    assert.equal(nodes(render()).filter((node) => node.props?.role === "option").length, 1);
    key("Escape");
    assert.equal(input().props["aria-expanded"], false);
    key("ArrowUp");
    key("Enter");
    assert.deepEqual(selected, ["another", "another", "another"]);
    props.onClear(); props.query = "";
    props.originalAccount = { id: "original", name: "Original inactive", isActive: false };
    key("ArrowDown");
    assert.equal(nodes(render()).filter((node) => node.props?.role === "option").length, 3);
    props.originalAccount.isDeleted = true;
    assert.equal(nodes(render()).filter((node) => node.props?.role === "option").length, 2);
    props.loading = true; props.query = "An";
    const beforeLoading = selected.length;
    key("Enter");
    assert.equal(selected.length, beforeLoading, "loading results cannot select a stale supplier");
  } finally { overrides.delete("react"); overrides.delete("next-intl"); cache.delete(path); }
});

test("customer invoice history can omit the repeated customer column without changing invoice lists", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  overrides.set("@/i18n/navigation", {
    Link: ({ href, children, ...props }) => React.createElement("a", { ...props, href }, children),
    useRouter: () => ({ push() {} }),
  });
  try {
    const { InvoicesList } = load("@/app/modules/invoices/components/invoices-list");
    const props = { invoices: [{ id: "one", invoiceNumber: "INV-1", customerId: "customer", type: "customer_sale", total: 1000, remaining: 0, status: "saved" }],
      customerNames: { customer: "Repeated Customer" }, status: "success", error: null,
      onRetry() {}, onPrint() {}, onShare() {}, onCancel() {}, onHistory() {},
    };
    const detail = renderToStaticMarkup(React.createElement(InvoicesList, { ...props, showCustomer: false }));
    assert.doesNotMatch(detail, /Repeated Customer|colCustomer/);
    const general = renderToStaticMarkup(React.createElement(InvoicesList, props));
    assert.match(general, /Repeated Customer/);
    assert.match(general, /colCustomer/);
  } finally { overrides.delete("next-intl"); overrides.delete("@/i18n/navigation"); }
});

test("invoice detail paid display includes extra account money only when present", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  try {
    const { InvoicePaidAmount } = load("@/app/modules/shared/components/invoice-paid-amount");
    const render = (accountPaymentAmount) => renderToStaticMarkup(React.createElement(InvoicePaidAmount, { paid: 1000, accountPaymentAmount, currency: "EGP" }));
    const extra = render(3000);
    assert.match(extra, /4,000/);
    assert.match(extra, /1,000[\s\S]*?\+[\s\S]*?3,000/);
    assert.match(extra, /previousDebtPayment/);
    const plain = render(0);
    assert.match(plain, /1,000/);
    assert.doesNotMatch(plain, /previousDebtPayment|\(/);
  } finally { overrides.delete("next-intl"); }
});

test("receipt payment uses a fixed total column and keeps the extra amount with its Arabic label", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  const { ReceiptPaidAmount } = load("@/app/modules/invoices/components/receipt-paid-amount");
  const html = renderToStaticMarkup(React.createElement(ReceiptPaidAmount, { paid: 500, accountPaymentAmount: 1500 }));
  assert.match(html, /<span class="col-start-3[^>]*><bdi>2,000<\/bdi><\/span>/);
  assert.match(html, /dir="ltr"[^>]*class="[^"]*payment-breakdown/);
  assert.match(html, /payment-account-portion[^>]*>[\s\S]*?1,500[\s\S]*?مديونية سابقة/);
});

test("payment notes distinguish invoice extras while preserving entered notes", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useTranslations: () => (key) => key === "additionalAccountPaymentNote" ? "(مديونية سابقة) إضافية" : key });
  try {
    const { PaymentNotes } = load("@/app/modules/shared/components/payment-notes");
    const extra = renderToStaticMarkup(React.createElement(PaymentNotes, { notes: "Customer memo", isAdditional: true }));
    assert.match(extra, /\(مديونية سابقة\) إضافية/);
    assert.match(extra, /Customer memo/);
    const ordinary = renderToStaticMarkup(React.createElement(PaymentNotes, { notes: "Normal payment", isAdditional: false }));
    assert.match(ordinary, /Normal payment/);
    assert.doesNotMatch(ordinary, /إضافية/);
  } finally { overrides.delete("next-intl"); }
});

test("customer payment rows stay split and label only extras or blank standalone debt notes", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  overrides.set("@/i18n/navigation", { Link: ({ children }) => React.createElement("a", {}, children) });
  try {
    const { PaymentsTable } = load("@/app/modules/payments/components/payments-table");
    const base = { customerId: "customer", method: "cash", notes: null, isReversed: false, reversedAt: null, invoiceId: null };
    const html = renderToStaticMarkup(React.createElement(PaymentsTable, {
      payments: [{ ...base, id: "extra", amount: 2000 }, { ...base, id: "invoice", invoiceId: "one", amount: 1000 }, { ...base, id: "manual", amount: 300, notes: "Manual memo" }],
      status: "success", error: null, onRetry() {}, onCancel() {}, onHistory() {},
    }));
    assert.match(html, /2,000/);
    assert.match(html, /1,000/);
    assert.match(html, /Manual memo/);
    assert.equal((html.match(/\(مديونية سابقة\) إضافية/g) ?? []).length, 1);
    assert.equal((html.match(/<tr\b/g) ?? []).length, 4);
  } finally { overrides.delete("next-intl"); overrides.delete("@/i18n/navigation"); }
});

test("selected customer uses the account panel and a change action instead of the search input", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  try {
    const { InvoiceCustomerSection } = load("@/app/modules/invoices/components/invoice-customer-section");
    const props = { type: "customer_sale", onTypeChange() {}, customerQuery: "", onCustomerQueryChange() {}, customerResults: [], customersLoading: false,
      selectedCustomer: { id: "one", name: "Selected Account", balance: 87900 }, onSelectCustomer() {}, onClearCustomer() {} };
    const html = renderToStaticMarkup(React.createElement(InvoiceCustomerSection, props));
    assert.match(html, /Selected Account/);
    assert.match(html, /87,900/);
    assert.match(html, /customerChange/);
    assert.doesNotMatch(html, /role="combobox"/);
    const credit = renderToStaticMarkup(React.createElement(InvoiceCustomerSection, { ...props, selectedCustomer: { ...props.selectedCustomer, balance: -500 } }));
    assert.match(credit, /customerCredit/);
    assert.match(credit, /500/);
  } finally { overrides.delete("next-intl"); }
});

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
  assert.match(html, /<bdi dir="ltr" class="inline-block whitespace-nowrap align-baseline">14<\/bdi> ملي مربع/);
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
      assert.match(html, /<bdi dir="ltr" class="inline-block whitespace-nowrap align-baseline">14<\/bdi> ملي مربع/);
      assert.doesNotMatch(html, /print-color-adjust:exact/);
      assert.match(html, compact ? /padding:3mm/ : /padding:12mm/);
      assert.match(html, compact ? /h-8 flex items-center justify-center whitespace-nowrap/ : /h-9 flex items-center justify-center whitespace-nowrap/);
      assert.match(html, compact ? /px-0\.5/ : /px-1/);
      assert.match(html, compact ? /px-1\.5[^"\n]*text-right/ : /px-2[^"\n]*text-right/);
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
  assert.deepEqual(describe("purchase_updated", "Purchase invoice updated: PUR-0005"), {
    key: "summaryWithValue", values: { action: "إجراء", value: "PUR-0005" },
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

test("purchase edit totals retain the account preview without capping entered payment", () => {
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  try {
    const { PurchaseTotals } = load("@/app/modules/purchases/components/purchase-totals");
    const html = renderToStaticMarkup(React.createElement(PurchaseTotals, {
      total: 350, paidInput: "100", onPaidChange() {}, remaining: 250,
      additionalAmount: 0, accountBalance: 750,
    }));
    assert.doesNotMatch(html, /max="350"/);
    assert.match(html, /750/);
    assert.doesNotMatch(html, /950/);
  } finally { overrides.delete("next-intl"); }
});

test("purchase supplier picker shares the searchable account control and restricts the inactive exception to the original", () => {
  overrides.set("next-intl", { useLocale: () => "en", useTranslations: () => (key) => key });
  overrides.set("react", { useState: () => [false, () => {}] });
  try {
    const { PurchaseSupplierSection } = load("@/app/modules/purchases/components/purchase-supplier-section");
    const { AccountCombobox } = load("@/app/modules/shared/components/account-combobox");
    const original = { id: "original", name: "Original", isActive: false };
    const props = { allSuppliers: [], allSuppliersLoading: false, supplierQuery: "query", supplierResults: [], suppliersLoading: true, selectedSupplier: null, originalSupplier: original, onSelectSupplier() {}, onSupplierQueryChange() {}, onClearSupplier() {}, notes: "", onNotesChange() {} };
    const nodes = (element) => !element || typeof element !== "object" ? [] : [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
    const picker = nodes(PurchaseSupplierSection(props)).find((node) => node.type === AccountCombobox);
    assert.equal(picker.props.query, "query");
    assert.equal(picker.props.loading, true);
    assert.equal(picker.props.originalAccount, original);
    assert.equal(picker.props.onQueryChange, props.onSupplierQueryChange);
    assert.equal(picker.props.labels.empty, "noSuppliersFound");
  } finally { overrides.delete("react"); overrides.delete("next-intl"); }
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
