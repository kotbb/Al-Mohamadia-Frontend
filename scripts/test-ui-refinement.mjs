import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const native = createRequire(import.meta.url);
const root = resolve(".");

function load(name, stubs = {}, cache = new Map(), parent = root) {
  if (name in stubs) return stubs[name];
  if (!name.startsWith(".") && !name.startsWith("@/")) return native(name);
  let file = resolve(name.startsWith("@/") ? root : parent, name.startsWith("@/") ? name.slice(2) : name);
  if (!/\.tsx?$/.test(file)) {
    try {
      readFileSync(file + ".ts");
      file += ".ts";
    } catch {
      file += ".tsx";
    }
  }
  if (cache.has(file)) return cache.get(file);
  const out = {};
  cache.set(file, out);
  new Function(
    "exports",
    "require",
    ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    }).outputText,
  )(out, (dep) => load(dep, stubs, cache, dirname(file)));
  return out;
}

function stubs(locale) {
  return {
    "next-intl": {
      useLocale: () => locale,
      useTranslations: () => (key, values) => (values ? `${key} ${Object.values(values).join(" ")}` : key),
    },
    "@/i18n/navigation": { Link: ({ children, ...props }) => createElement("a", props, children) },
  };
}

for (const locale of ["ar", "en"]) {
  test(`dashboard preserves all values, loss semantics and debtor destination (${locale})`, () => {
    const { DashboardTodayKpis } = load("@/app/modules/dashboard/components/dashboard-today-kpis", stubs(locale));
    const values = { sales: 1234567.89, estimatedProfit: -45.67, invoiceCount: 17, collected: 876.54 };
    const debt = { totalDebt: 381060.1, debtorCount: 36 };
    const html = renderToStaticMarkup(createElement(DashboardTodayKpis, { today: values, debt }));
    const money = new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    for (const value of [values.sales, values.estimatedProfit, values.collected, debt.totalDebt]) {
      assert.ok(html.includes(money.format(value)));
    }
    assert.match(html, />17<\/bdi>/);
    assert.match(html, /href="\/customers\?hasDebt=1"/);
    assert.match(html, /debtorCount 36/);
    assert.equal((html.match(/<dt /g) ?? []).length, 5);
    assert.equal((html.match(/<svg/g) ?? []).length, 1, "only the functional debtor-link chevron remains");
    assert.match(html, /text-danger/);
    const zero = renderToStaticMarkup(
      createElement(DashboardTodayKpis, {
        today: { sales: 0, estimatedProfit: 0, invoiceCount: 0, collected: 0 },
        debt,
      }),
    );
    assert.match(zero, /text-success/);
    assert.match(zero, /text-danger/);
    assert.match(zero, /lg:grid-cols-3/);
    assert.match(zero, /text-2xl font-bold/);
    assert.ok(zero.includes(money.format(0)));
  });

  test(`account debt and signed credit retain their colors and labels (${locale})`, () => {
    const { AccountFinancialSummary } = load(
      "@/app/modules/shared/components/account-financial-summary",
      stubs(locale),
    );
    for (const party of ["customer", "supplier"]) {
      for (const currentBalance of [100.25, 0, -12.5]) {
        const html = renderToStaticMarkup(
          createElement(AccountFinancialSummary, {
            totalInvoiced: 500,
            totalPaid: 200,
            currentBalance,
            party,
            currency: "EGP",
          }),
        );
        if (party === "customer" && currentBalance > 0) assert.match(html, /text-danger/);
        else assert.doesNotMatch(html, /text-danger/);
        assert.match(
          html,
          new RegExp(currentBalance < 0 ? `${party}Credit` : party === "customer" ? "customerOwes" : "owedToSupplier"),
        );
        assert.ok(html.includes(new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(currentBalance)));
      }
    }
  });
}

test("unnamed inputs have unique error associations and preserve external descriptions", () => {
  const { Input } = load("@/app/modules/shared/components/input");
  const html = renderToStaticMarkup(
    createElement(
      "div",
      null,
      createElement(Input, { label: "First", error: "Required", "aria-describedby": "context" }),
      createElement(Input, { label: "Second", hint: "Optional" }),
    ),
  );
  const ids = [...html.matchAll(/<input[^>]* id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 2);
  assert.notEqual(ids[0], ids[1]);
  assert.ok(html.includes(`aria-describedby="context ${ids[0]}-error"`));
  assert.ok(html.includes(`id="${ids[0]}-error"`));
  assert.ok(html.includes(`aria-describedby="${ids[1]}-hint"`));
  assert.match(html, /aria-invalid="true"/);
  assert.doesNotMatch(html, /undefined-(?:error|hint)/);
});

test("loading dashboard announces loading without showing fabricated amounts", () => {
  const { DashboardSkeleton } = load("@/app/modules/dashboard/components/dashboard-skeleton");
  const html = renderToStaticMarkup(createElement(DashboardSkeleton, { message: "Loading dashboard" }));
  assert.match(html, /role="status"/);
  assert.match(html, /Loading dashboard/);
  assert.doesNotMatch(html, /<dd|<bdi|href=/);
});

test("both themes keep helper and warning/info text readable while preserving requested green/red shades", () => {
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /--success: #2e8f52;/);
  assert.match(css, /--danger: #c13b2e;/);
  const luminance = (rgb) =>
    rgb
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (a, b) => {
    const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
    return (high + 0.05) / (low + 0.05);
  };
  for (const theme of [":root", ".dark"]) {
    const block = css.slice(css.indexOf(`${theme} {`)).split("}")[0];
    const tokens = Object.fromEntries(
      [...block.matchAll(/--([\w-]+): #([\da-f]{6});/gi)].map(([, key, value]) => [
        key,
        [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)),
      ]),
    );
    for (const surface of ["background", "surface", "surface-muted"]) {
      for (const text of ["text-primary", "text-secondary", "text-muted"]) {
        assert.ok(contrast(tokens[text], tokens[surface]) >= 4.5, `${theme}: ${text} on ${surface}`);
      }
      for (const text of ["warning", "info"]) {
        const tinted = tokens[text].map((v, i) => v * 0.12 + tokens[surface][i] * 0.88);
        assert.ok(contrast(tokens[text], tinted) >= 4.5, `${theme}: ${text} on tinted ${surface}`);
      }
    }
  }
});
