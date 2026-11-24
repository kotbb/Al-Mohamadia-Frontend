import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(resolve(import.meta.dirname, "../app/modules/shared/utils/url-state.ts"), "utf8");
const codecModule = { exports: {} };
new Function(
  "require",
  "module",
  "exports",
  ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
)(require, codecModule, codecModule.exports);
const { readUrlState, writeUrlState } = codecModule.exports;
const query = new URLSearchParams("q=wood&page=3&status=saved&from=2026-02-30&invoicePage=4&new=1");
assert.equal(readUrlState(query, "page", 1), 3);
assert.equal(readUrlState(new URLSearchParams("page=-2"), "page", 1), 1);
assert.equal(readUrlState(new URLSearchParams("page=1.5"), "page", 1), 1);
assert.equal(readUrlState(query, "status", "all", ["all", "saved", "cancelled"]), "saved");
assert.equal(readUrlState(new URLSearchParams("status=bad"), "status", "all", ["all", "saved"]), "all");
assert.equal(readUrlState(query, "from", "2026-02-01"), "2026-02-01");
assert.equal(readUrlState(new URLSearchParams("hasDebt=true"), "hasDebt", "all"), "hasDebt");
const filters = readUrlState(new URLSearchParams("q=timber&isActive=false&categoryId=one"), "", {
  search: "",
  isActive: "all",
  categoryId: "",
});
assert.deepEqual(filters, { search: "timber", isActive: "inactive", categoryId: "one" });
writeUrlState(query, "page", 2, 1);
writeUrlState(query, "invoicePage", 1, 1);
assert.equal(query.get("new"), "1");
assert.equal(query.get("q"), "wood");
assert.equal(query.get("page"), "2");
assert.equal(query.has("invoicePage"), false);
writeUrlState(
  query,
  "",
  { search: "", isActive: "active", categoryId: "two" },
  { search: "", isActive: "all", categoryId: "" },
);
assert.equal(query.has("q"), false);
assert.equal(query.get("isActive"), "true");
assert.equal(query.get("categoryId"), "two");
assert.equal(readUrlState(new URLSearchParams("auditFrom=2026-02-30"), "auditFrom", ""), "");
assert.equal(readUrlState(new URLSearchParams("hasDebt=0"), "hasDebt", "hasDebt"), "all");

// Exercise the real hook with the documented native-history boundary.
let address = new URL("https://shop.test/ar/invoices?q=timber&page=3&new=1#rows");
const metadata = { existingFrameworkState: true, app: { index: 4 } };
const writes = [];
globalThis.window = {
  get location() {
    return address;
  },
  history: {
    state: metadata,
    replaceState(state, _title, url) {
      writes.push({ state, url });
      address = new URL(url, address);
    },
  },
};
const refs = [];
let cursor = 0;
const hooks = {
  useState(value) {
    const index = cursor++;
    if (!(index in refs)) refs[index] = typeof value === "function" ? value() : value;
    return [refs[index], () => {}];
  },
  useCallback(fn) {
    return fn;
  },
  useMemo(fn) {
    return fn();
  },
};
const compiledHook = ts.transpileModule(
  readFileSync(resolve(import.meta.dirname, "../app/modules/shared/hooks/use-url-state.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const hookModule = { exports: {} };
new Function("require", "module", "exports", compiledHook)(
  (name) =>
    name === "react"
      ? hooks
      : name === "next/navigation"
        ? { useSearchParams: () => new URLSearchParams(address.search) }
        : codecModule.exports,
  hookModule,
  hookModule.exports,
);
let [page, setPage] = hookModule.exports.useUrlState("page", 1);
assert.equal(page, 3, "initial render must use restored page before the first request");
assert.equal(writes.length, 0, "hydrating URL state must not reset the restored page");
setPage((previous) => previous + 1);
assert.equal(address.searchParams.get("page"), "4");
assert.equal(address.searchParams.get("q"), "timber");
assert.equal(address.searchParams.get("new"), "1");
assert.equal(address.hash, "#rows");
assert.deepEqual(writes.at(-1).state, metadata, "URL changes must retain framework/app history metadata");
cursor = 0;
[page, setPage] = hookModule.exports.useUrlState("page", 1);
assert.equal(page, 4);
setPage(1);
assert.equal(address.searchParams.has("page"), false);
delete globalThis.window;
console.log("URL state codec checks passed");

const routerSource = readFileSync(
  resolve(import.meta.dirname, "../node_modules/next/dist/client/components/app-router.js"),
  "utf8",
);
const copyStart = routerSource.indexOf("function copyNextJsInternalHistoryState(data)");
const copyEnd = routerSource.indexOf("\nfunction Head(", copyStart);
const replaceStart = routerSource.indexOf("window.history.replaceState = function replaceState(");
const replaceEnd = routerSource.indexOf("\n        };", replaceStart) + "\n        };".length;
assert.ok(
  copyStart >= 0 && copyEnd > copyStart && replaceStart >= 0 && replaceEnd > replaceStart,
  "installed Next history boundary is available",
);
let visibleQuery = "?page=3";
let notifications = 0;
address = new URL("https://shop.test/ar/invoices?page=3#rows");
const nativeState = {
  __NA: true,
  __PRIVATE_NEXTJS_INTERNALS_TREE: { tree: "installed-router-tree" },
  app: { entry: "origin", position: 4 },
};
const boundaryWindow = {
  get location() {
    return address;
  },
  history: { state: nativeState },
};
const originalReplace = (state, _title, href) => {
  boundaryWindow.history.state = state;
  address = new URL(href, address);
};
const notify = (href) => {
  notifications++;
  visibleQuery = new URL(href, address).search;
};
new Function(
  "window",
  "originalReplaceState",
  "applyUrlFromHistoryPushReplace",
  `${routerSource.slice(copyStart, copyEnd)}\n${routerSource.slice(replaceStart, replaceEnd)}`,
)(boundaryWindow, originalReplace, notify);
globalThis.window = boundaryWindow;
const boundaryHookModule = { exports: {} };
const boundarySlots = [];
let boundaryCursor = 0;
const boundaryReact = {
  useState(value) {
    const index = boundaryCursor++;
    if (!(index in boundarySlots)) boundarySlots[index] = typeof value === "function" ? value() : value;
    return [boundarySlots[index], () => {}];
  },
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
};
new Function("require", "module", "exports", compiledHook)(
  (name) =>
    name === "react"
      ? boundaryReact
      : name === "next/navigation"
        ? { useSearchParams: () => new URLSearchParams(visibleQuery) }
        : codecModule.exports,
  boundaryHookModule,
  boundaryHookModule.exports,
);
let [displayedPage, changePage] = boundaryHookModule.exports.useUrlState("page", 1);
assert.equal(displayedPage, 3);
changePage(4);
boundaryCursor = 0;
[displayedPage, changePage] = boundaryHookModule.exports.useUrlState("page", 1);
assert.equal(address.searchParams.get("page"), "4");
assert.equal(displayedPage, 4, "Next must notify the frontend after a filter/page URL change");
assert.equal(notifications, 1, "metadata preservation must not trigger a second frontend update");
assert.deepEqual(
  boundaryWindow.history.state.app,
  nativeState.app,
  "navigation metadata survives the notifying update",
);
assert.deepEqual(
  boundaryWindow.history.state.__PRIVATE_NEXTJS_INTERNALS_TREE,
  nativeState.__PRIVATE_NEXTJS_INTERNALS_TREE,
);
changePage(1);
boundaryCursor = 0;
[displayedPage] = boundaryHookModule.exports.useUrlState("page", 1);
assert.equal(displayedPage, 1, "clearing a query key also updates the frontend");
assert.equal(address.hash, "#rows");
delete globalThis.window;
console.log("Installed Next history notification checks passed");
// The same boundary drives dropdowns and independent date controls, not just pages.
// Updates are back-to-back, as filter actions also reset their owning pagination.
globalThis.window = boundaryWindow;
boundarySlots.length = 0;
function renderFilters() {
  boundaryCursor = 0;
  const [status, setStatus] = boundaryHookModule.exports.useUrlState("status", "all", ["all", "saved", "cancelled"]);
  const [range, setRange] = boundaryHookModule.exports.useUrlState("", { from: "", to: "" });
  const [currentPage, setCurrentPage] = boundaryHookModule.exports.useUrlState("page", 1);
  return { status, setStatus, range, setRange, currentPage, setCurrentPage };
}
let filtersView = renderFilters();
filtersView.setStatus("cancelled");
filtersView.setCurrentPage(1);
filtersView = renderFilters();
assert.equal(filtersView.status, "cancelled");
assert.equal(filtersView.currentPage, 1);
filtersView.setRange({ from: "2026-11-01", to: "2026-11-05" });
filtersView = renderFilters();
assert.deepEqual(filtersView.range, { from: "2026-11-01", to: "2026-11-05" });
assert.equal(filtersView.status, "cancelled");
filtersView.setStatus("all");
filtersView = renderFilters();
assert.equal(filtersView.status, "all");
assert.deepEqual(filtersView.range, { from: "2026-11-01", to: "2026-11-05" });
assert.deepEqual(boundaryWindow.history.state.app, nativeState.app);
delete globalThis.window;
console.log("Filter controls track installed Next notifications");
