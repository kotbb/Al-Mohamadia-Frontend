import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = "app/modules/shared/utils/navigation-history.ts";
function load() {
  const m = { exports: {} };
  new Function("module", "exports", ts.transpile(readFileSync(source, "utf8"), { module: ts.ModuleKind.CommonJS }))(
    m,
    m.exports,
  );
  return m.exports;
}
test("return destinations accept only internal application paths", () => {
  const { safeReturnPath } = load();
  for (const value of [
    "//evil.test",
    "/\\evil.test",
    "https://evil.test",
    "javascript:alert(1)",
    "/%2f%2fevil.test",
    null,
  ])
    assert.equal(safeReturnPath(value, "/invoices"), "/invoices");
  assert.equal(
    safeReturnPath("/customers/123?invoicePage=3#history", "/invoices"),
    "/customers/123?invoicePage=3#history",
  );
});
test("traversals guard only departing dialog layers, all guards for route departure", () => {
  const { departingGuardKeys } = load();
  assert.deepEqual(departingGuardKeys(["form", "child"], ["form"], ["route", "form", "child"], false), ["child"]);
  assert.deepEqual(departingGuardKeys(["form", "child"], [], ["route", "form", "child"], true), [
    "route",
    "form",
    "child",
  ]);
});
test("history entries preserve origin on replacements and advance on pushes", () => {
  const { nextHistoryEntry } = load();
  const first = { id: "a", position: 2, url: "/invoices?page=3", layers: [], source: null };
  assert.deepEqual(nextHistoryEntry(first, "/invoices/1", "b", false), {
    id: "b",
    position: 3,
    url: "/invoices/1",
    layers: [],
    source: "/invoices?page=3",
    sourceEntryId: "a",
  });
  assert.deepEqual(nextHistoryEntry(first, "/invoices/2", "b", true), { ...first, url: "/invoices/2" });
});
function loadHistory() {
  const m = { exports: {} };
  const code = ts.transpile(readFileSync("app/modules/shared/utils/app-history.ts", "utf8"), {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  });
  new Function("module", "exports", "require", code)(m, m.exports, () => load());
  return m.exports.AppHistory;
}
function driver({ deferred = false } = {}) {
  let queuedNavigation;
  const listeners = new Map();
  const stack = [{ url: "/en/invoices?page=3", state: { framework: "preserved" } }];
  let at = 0;
  const navigations = [];
  let question;
  const storage = new Map();
  const browser = {
    sessionStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    location: new URL("https://shop.test" + stack[0].url),
    addEventListener(type, fn) {
      listeners.set(type, fn);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    dispatchEvent(event) {
      listeners.get(event.type)?.(event);
    },
    history: {
      get state() {
        return stack[at].state;
      },
      replaceState(state, _, url) {
        stack[at] = { state, url };
        browser.location = new URL(url, browser.location);
      },
      pushState(state, _, url) {
        stack.splice(at + 1);
        stack.push({ state, url });
        at++;
        browser.location = new URL(url, browser.location);
      },
      go(delta) {
        const next = at + delta;
        if (next < 0 || next >= stack.length) return;
        at = next;
        browser.location = new URL(stack[at].url, browser.location);
        listeners.get("popstate")?.({ state: stack[at].state, stopImmediatePropagation() {} });
      },
      back() {
        this.go(-1);
      },
    },
  };
  const Controller = loadHistory();
  let controller = new Controller(
    browser,
    "user",
    (url, replace) => {
      navigations.push(url);
      if (deferred) {
        queuedNavigation = { url, replace };
        return;
      }
      if (replace) browser.history.replaceState(browser.history.state, "", url);
      else browser.history.pushState(browser.history.state, "", url);
      controller.commit();
    },
    (proceed, stay) => {
      question = { proceed, stay };
    },
  );
  return {
    finishNavigation() {
      const { url, replace } = queuedNavigation;
      if (replace) browser.history.replaceState(browser.history.state, "", url);
      else browser.history.pushState({}, "", url);
      controller.commit();
    },
    get controller() {
      return controller;
    },
    restart() {
      controller.dispose();
      controller = new Controller(
        browser,
        "user",
        (url, replace) => {
          navigations.push(url);
          if (replace) browser.history.replaceState(browser.history.state, "", url);
          else browser.history.pushState(browser.history.state, "", url);
          controller.commit();
        },
        (proceed, stay) => {
          question = { proceed, stay };
        },
      );
    },
    browser,
    navigations,
    stack,
    get question() {
      return question;
    },
    get at() {
      return at;
    },
  };
}
test("dirty Back restores current entry and Stay retains route; Discard replays once", () => {
  const d = driver();
  d.controller.push("/en/invoices/new");
  d.controller.registerGuard("draft", { dirty: true, busy: false });
  d.controller.back();
  assert.equal(d.at, 1);
  assert.equal(d.browser.location.pathname, "/en/invoices/new");
  assert.ok(d.question);
  d.question.stay();
  d.controller.back();
  d.question.proceed();
  assert.equal(d.at, 0);
  assert.equal(d.browser.location.pathname, "/en/invoices");
  assert.equal(d.stack[0].state.framework, "preserved");
});
test("nested modal Back guards the departing child and restores parent on Forward", () => {
  const d = driver();
  let child = 0;
  d.controller.openLayer(
    "parent",
    () => {},
    () => {},
  );
  d.controller.registerGuard("parentDraft", { dirty: true, busy: false, layerKey: "parent" });
  d.controller.openLayer(
    "child",
    () => child--,
    () => child++,
  );
  child = 1;
  d.controller.back();
  assert.equal(child, 0);
  assert.equal(d.question, undefined);
  d.browser.history.go(1);
  assert.equal(child, 1);
});
test("route departure checks dirty parents and nested approved requests do not reprompt", () => {
  const d = driver();
  d.controller.openLayer("parent", () => {});
  d.controller.registerGuard("draft", { dirty: true, busy: false });
  d.controller.openLayer("child", () => {});
  d.controller.request(() => d.controller.push("/en/customers"));
  assert.equal(d.navigations.length, 0);
  d.question.proceed();
  assert.deepEqual(d.navigations, ["/en/customers"]);
});
test("busy Back remains on the form without a discard prompt", () => {
  const d = driver();
  d.controller.push("/en/invoices/new");
  d.controller.registerGuard("save", { dirty: true, busy: true });
  d.controller.back();
  assert.equal(d.at, 1);
  assert.equal(d.question, undefined);
});
test("completed edit Back/Forward never returns to a submitted form", () => {
  const d = driver();
  d.controller.push("/en/invoices/1");
  d.controller.push("/en/invoices/1/edit");
  d.controller.complete("/en/invoices/1");
  assert.equal(d.at, 2);
  d.controller.back();
  assert.equal(d.at, 0);
  d.browser.history.go(1);
  assert.equal(d.browser.location.pathname, "/en/invoices/1");
  assert.ok(!d.browser.location.pathname.endsWith("/edit"));
});
test("Back after revisiting a completed editor skips an adjacent duplicate detail", () => {
  const d = driver();
  d.controller.push("/en/invoices/1");
  d.controller.push("/en/invoices/1/edit");
  d.controller.complete("/en/invoices/1");
  d.browser.history.go(1);
  d.controller.back();
  assert.equal(d.browser.location.pathname, "/en/invoices");
});
test("same-page links leave navigation available", () => {
  const d = driver();
  d.controller.push("/en/invoices?page=3");
  d.controller.push("/en/customers");
  assert.deepEqual(d.navigations, ["/en/customers"]);
});
test("completed edit mapping survives refresh before Forward", () => {
  const d = driver();
  d.controller.push("/en/invoices/1");
  d.controller.push("/en/invoices/1/edit");
  d.controller.complete("/en/invoices/1");
  d.restart();
  d.browser.history.go(1);
  assert.equal(d.browser.location.pathname, "/en/invoices/1");
});
test("refresh reconciles history layers without restored descriptors", () => {
  const d = driver();
  d.controller.openLayer("unrestored", () => {});
  d.restart();
  d.controller.reconcileLayers();
  assert.equal(d.at, 0);
});
test("successful modal completion does not reopen the submitted editor on Forward", async () => {
  const d = driver();
  let restored = 0;
  const close = d.controller.openLayer(
    "edit",
    () => {},
    () => restored++,
  );
  close();
  await new Promise((resolve) => queueMicrotask(resolve));
  assert.equal(d.at, 0);
  d.browser.history.go(1);
  assert.equal(restored, 0);
});
test("slow feature restoration holds reconciliation until descriptors register", () => {
  const d = driver();
  d.controller.openLayer("ledger:form", () => {});
  d.restart();
  const release = d.controller.holdRestoration();
  d.controller.reconcileLayers();
  assert.equal(d.at, 1);
  d.controller.openLayer("ledger:form", () => {});
  release();
  assert.equal(d.at, 1);
});
test("intermediate React commits cannot stamp a pending destination onto its source", () => {
  const d = driver({ deferred: true });
  d.controller.push("/en/customers");
  d.controller.commit();
  assert.equal(d.stack[0].state["al-navigation-v1:user"].position, 0);
  d.finishNavigation();
  d.controller.back();
  assert.equal(d.at, 0);
  assert.equal(d.browser.location.pathname, "/en/invoices");
});
test("unmounting a modal during route navigation never issues a second Back", async () => {
  const d = driver({ deferred: true });
  const close = d.controller.openLayer("audit", () => {});
  d.controller.push("/en/customers");
  close();
  await new Promise((resolve) => queueMicrotask(resolve));
  assert.equal(d.at, 1);
  d.finishNavigation();
  assert.equal(d.at, 2);
  d.controller.back();
  assert.equal(d.at, 1);
});
test("ordinary adjacent same-URL entries do not recursively traverse to the first page", () => {
  const d = driver();
  d.controller.push("/en/customers");
  d.controller.push("/en/customers/1");
  d.browser.history.replaceState(
    {
      ...d.browser.history.state,
      "al-navigation-v1:user": { ...d.browser.history.state["al-navigation-v1:user"], url: "/en/customers" },
    },
    "",
    "/en/customers",
  );
  d.controller.commit();
  d.controller.back();
  assert.equal(d.at, 1);
});
test("dashboard to list to detail to profile returns exactly one page per action", () => {
  const d = driver();
  d.browser.history.replaceState(d.browser.history.state, "", "/en");
  d.controller.commit();
  d.controller.push("/en/invoices");
  d.controller.push("/en/invoices/1");
  d.controller.push("/en/customers/1");
  for (const [path, index] of [
    ["/en/invoices/1", 2],
    ["/en/invoices", 1],
    ["/en", 0],
  ]) {
    d.controller.back();
    assert.equal(d.browser.location.pathname, path);
    assert.equal(d.at, index);
  }
});
test("repeated app Back clicks before popstate traverse once", async () => {
  const d = driver();
  d.controller.push("/en/customers");
  d.controller.push("/en/customers/1");
  d.browser.history.back = () => queueMicrotask(() => d.browser.history.go(-1));
  d.controller.back();
  d.controller.back();
  await new Promise((resolve) => queueMicrotask(resolve));
  assert.equal(d.at, 1);
  assert.equal(d.browser.location.pathname, "/en/customers");
});

test("save explicitly replaces editor, even when completion repeats before traversal", async () => {
  const d = driver();
  d.controller.push("/en/customers/1?invoicePage=3");
  d.controller.push("/en/invoices/7");
  d.controller.push("/en/invoices/7/edit");
  let traversals = 0;
  const nativeBack = d.browser.history.back;
  d.browser.history.back = () => {
    traversals++;
    queueMicrotask(() => nativeBack.call(d.browser.history));
  };
  d.controller.complete("/en/invoices/7");
  d.controller.complete("/en/invoices/7");
  assert.equal(d.browser.location.pathname, "/en/invoices/7");
  assert.equal(traversals, 0);
  d.controller.back();
  await new Promise(setImmediate);
  assert.equal(d.browser.location.pathname, "/en/customers/1");
  assert.equal(d.browser.location.search, "?invoicePage=3");
});
test("pending duplicate completion cannot change its explicit destination", () => {
  const d = driver({ deferred: true });
  d.controller.complete("/en/invoices/7");
  d.controller.complete("/en/invoices/8");
  assert.deepEqual(d.navigations, ["/en/invoices/7"]);
  d.finishNavigation();
  d.restart();
  assert.equal(d.browser.location.pathname, "/en/invoices/7");
});
test("completed replacement browsing does not redirect Forward to an older invoice", () => {
  const d = driver();
  d.controller.push("/en/customers/1");
  d.controller.push("/en/invoices/7");
  d.controller.push("/en/invoices/7/edit");
  d.controller.complete("/en/invoices/7");
  d.controller.replace("/en/invoices/8?navigation=customer");
  d.restart();
  d.controller.back();
  assert.equal(d.browser.location.pathname, "/en/customers/1");
  d.browser.history.go(2);
  assert.equal(d.browser.location.pathname, "/en/invoices/8");
});
test("purchase edit, direct profile edit and new save-print use explicit results", () => {
  for (const [source, edit, result] of [
    ["/en/suppliers/1", "/en/purchases/7/edit", "/en/purchases/7"],
    ["/en/customers/1", "/en/invoices/7/edit", "/en/invoices/7"],
    ["/en/customers/1", "/en/invoices/new", "/en/invoices/7/export"],
  ]) {
    const d = driver();
    d.controller.push(source);
    d.controller.push(edit);
    d.controller.registerGuard("form", { dirty: true, busy: true });
    d.controller.complete(result);
    assert.equal(d.browser.location.pathname, result);
    assert.equal(d.question, undefined);
    d.controller.back();
    assert.equal(d.browser.location.pathname, source);
  }
});
