import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import ts from "typescript";

function transpile(file, stubs, cache = new Map()) {
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const js = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function("exports", "require", js)(exports, (name) => {
    if (name in stubs) return stubs[name];
    const target = resolve(dirname(file), name + ".ts");
    return transpile(target, stubs, cache);
  });
  return exports;
}

test("ledger restoration holds history until delayed editor hydration commits, without overwriting its snapshot", async () => {
  const slots = [],
    effects = [],
    pending = [];
  let cursor = 0,
    navigation = null,
    active = 0,
    writes = 0,
    finish;
  const session = JSON.stringify({ entries: [{ kind: "form", key: "ledger:edit", id: "movement" }], position: 0 });
  const previous = globalThis.window;
  globalThis.window = {
    sessionStorage: { getItem: () => session, setItem: () => writes++ },
    history: { state: { "al-navigation-v1:user": { layers: ["ledger:edit"] } } },
  };
  const user = { id: "user" };
  const react = {
    useContext: () => navigation,
    useRef: (value) => {
      const index = cursor++;
      return (slots[index] ??= { current: value });
    },
    useReducer: (reducer, initial) => {
      const index = cursor++;
      slots[index] ??= initial;
      return [
        slots[index],
        (action) => {
          slots[index] = reducer(slots[index], action);
        },
      ];
    },
    useCallback: (fn) => {
      cursor++;
      return fn;
    },
    useEffect: (effect, deps) => {
      const index = cursor++;
      const prior = effects[index];
      if (!prior || deps.some((value, i) => !Object.is(value, prior.deps[i]))) {
        pending.push(() => {
          prior?.cleanup?.();
          effects[index] = { deps, cleanup: effect() };
        });
      }
    },
  };
  try {
    const { useLedgerDialogFlow: runLedgerDialogFlow } = transpile(
      resolve("app/modules/personal-ledger/hooks/use-ledger-dialog-flow.ts"),
      {
        react,
        "@/lib/auth/auth-provider": { useAuth: () => ({ user }) },
        "@/app/modules/shared/components/navigation-context": { NavigationContext: {} },
        "../services/personal-ledger.service": {
          getPersonalLedgerMovement: () =>
            new Promise((resolve) => {
              finish = resolve;
            }),
        },
      },
    );
    const render = () => {
      cursor = 0;
      const state = runLedgerDialogFlow();
      while (pending.length) pending.shift()();
      return state;
    };
    render();
    assert.equal(writes, 0, "no fallback controller may overwrite saved context");
    navigation = {
      holdRestoration: () => {
        active++;
        let done = false;
        return () => {
          if (!done) {
            done = true;
            active--;
          }
        };
      },
    };
    render();
    assert.equal(active, 1);
    assert.equal(writes, 0);
    await new Promise(setImmediate);
    assert.equal(active, 1, "slow API must keep the history barrier held");
    finish({ id: "movement", amount: 10 });
    await new Promise(setImmediate);
    assert.equal(active, 1, "resolving a fetch alone is not a committed dialog tree");
    const result = render();
    assert.equal(result.flow.entries[0].movement.id, "movement");
    assert.equal(active, 0);
    assert.equal(writes, 1);
    for (const effect of effects) effect?.cleanup?.();
    assert.equal(active, 0, "cleanup release is idempotent");
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});
