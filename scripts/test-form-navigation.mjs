import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
const source = readFileSync("app/modules/shared/utils/form-snapshot.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const testModule = { exports: {} };
new Function("module", "exports", "require", compiled)(testModule, testModule.exports, require);
const { formSnapshot } = testModule.exports;
assert.equal(
  formSnapshot({ lines: [{ key: "first", itemId: "a", quantity: "1" }] }),
  formSnapshot({ lines: [{ key: "new-key", itemId: "a", quantity: "1" }] }),
);
assert.notEqual(formSnapshot({ name: "Old" }), formSnapshot({ name: "New" }));
assert.equal(formSnapshot({ name: "Old" }), formSnapshot({ name: "Old" }));
console.log("Form snapshots preserve editable fields and ignore generated line keys.");
const cells = [];
let cursor = 0;
let guard;
const fakeReact = {
  useState(initial) {
    const i = cursor++;
    if (!(i in cells)) cells[i] = typeof initial === "function" ? initial() : initial;
    return [
      cells[i],
      (next) => {
        cells[i] = typeof next === "function" ? next(cells[i]) : next;
      },
    ];
  },
  useCallback(fn) {
    return fn;
  },
};
function hookModule(path) {
  const result = { exports: {} };
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function("module", "exports", "require", code)(result, result.exports, (id) =>
    id === "react"
      ? fakeReact
      : id.endsWith("form-snapshot")
        ? { formSnapshot }
        : id.endsWith("use-leave-guard")
          ? {
              useLeaveGuard: (value) => {
                guard = value;
              },
            }
          : id.endsWith("use-app-navigation")
            ? { useAppNavigation: () => ({ dismiss: (fn) => fn() }) }
            : require(id),
  );
  return result.exports;
}
const { useFormDirtyState } = hookModule("app/modules/shared/hooks/use-form-dirty-state.ts");
function render(fn, ...args) {
  cursor = 0;
  return fn(...args);
}
let form = render(useFormDirtyState, { name: "Initial" });
assert.equal(form.isDirty, false);
form = render(useFormDirtyState, { name: "Changed" });
assert.equal(form.isDirty, true);
form = render(useFormDirtyState, { name: "Initial" });
assert.equal(form.isDirty, false);
form.resetBaseline({ name: "Hydrated" });
form = render(useFormDirtyState, { name: "Hydrated" });
assert.equal(form.isDirty, false);
cells.length = 0;
const { useModalFormGuard } = hookModule("app/modules/shared/hooks/use-modal-form-guard.ts");
render(useModalFormGuard, false, { amount: "" }, false);
assert.equal(guard.enabled, false);
render(useModalFormGuard, true, { amount: "100" }, false);
render(useModalFormGuard, true, { amount: "100" }, false);
assert.equal(guard.dirty, false);
render(useModalFormGuard, true, { amount: "150" }, false);
assert.equal(guard.dirty, true);
render(useModalFormGuard, true, { amount: "100" }, false);
assert.equal(guard.dirty, false);
render(useModalFormGuard, false, { amount: "" }, false);
render(useModalFormGuard, true, { amount: "200" }, false);
render(useModalFormGuard, true, { amount: "200" }, true);
assert.equal(guard.dirty, false);
assert.equal(guard.busy, true);
console.log("Dirty baselines cover changes, reversions, hydration, payment defaults and reopening.");
