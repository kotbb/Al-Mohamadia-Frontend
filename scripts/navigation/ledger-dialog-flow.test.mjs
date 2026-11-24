import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const file = "app/modules/personal-ledger/utils/ledger-dialog-flow.ts";
function load() {
  const source = readFileSync(file, "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function("exports", output)(exports);
  return exports;
}
test("ledger Back restores each immediate parent and Forward restores its child", () => {
  const { ledgerDialogFlow } = load();
  let state = { entries: [], position: -1 };
  for (const entry of [
    { key: "contacts", kind: "contacts" },
    { key: "person", kind: "contact", id: "1" },
    { key: "movement", kind: "movement", id: "2" },
  ])
    state = ledgerDialogFlow(state, { type: "push", entry });
  state = ledgerDialogFlow(state, { type: "back" });
  assert.equal(state.entries[state.position].key, "person");
  state = ledgerDialogFlow(state, { type: "back" });
  assert.equal(state.entries[state.position].key, "contacts");
  state = ledgerDialogFlow(state, { type: "restore", key: "movement" });
  assert.equal(state.entries[state.position].key, "movement");
});
test("opening a different ledger step truncates the abandoned Forward branch", () => {
  const { ledgerDialogFlow } = load();
  let state = {
    entries: [
      { key: "parent", kind: "contacts" },
      { key: "old", kind: "movement", id: "1" },
    ],
    position: 0,
  };
  state = ledgerDialogFlow(state, { type: "push", entry: { key: "new", kind: "contact", id: "2" } });
  assert.deepEqual(
    state.entries.map((entry) => entry.key),
    ["parent", "new"],
  );
});
test("deleting a ledger movement prunes its stale details and keeps its nearest surviving parent", () => {
  const { ledgerDialogFlow } = load();
  const state = ledgerDialogFlow(
    {
      entries: [
        { key: "parent", kind: "contacts" },
        { key: "detail", kind: "movement", id: "1" },
        { key: "delete", kind: "delete", movement: { id: "1" } },
      ],
      position: 2,
    },
    { type: "deleted", id: "1" },
  );
  assert.equal(state.entries[state.position].key, "parent");
  assert.equal(state.entries.length, 1);
});
test("ledger session snapshots preserve descriptors without movement data or drafts", () => {
  const source = readFileSync("app/modules/personal-ledger/utils/ledger-dialog-session.ts", "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function("exports", output)(exports);
  const serialized = exports.ledgerDialogSession({
    position: 1,
    entries: [
      { kind: "contacts", key: "contacts" },
      { kind: "form", key: "edit", movement: { id: "1", amount: 1234, notes: "Private draft" } },
    ],
  });
  assert.deepEqual(serialized, {
    position: 1,
    entries: [
      { kind: "contacts", key: "contacts" },
      { kind: "form", key: "edit", id: "1" },
    ],
  });
  assert.deepEqual(exports.parseLedgerDialogSession(JSON.stringify(serialized)), serialized);
  assert.equal(exports.parseLedgerDialogSession('{"entries":[],"position":2}'), null);
  assert.equal(exports.parseLedgerDialogSession("invalid"), null);
});
test("successful ledger save removes its completed editor and stale callbacks cannot close the parent", () => {
  const { ledgerDialogFlow } = load();
  let state = {
    entries: [
      { key: "parent", kind: "movement", id: "1" },
      { key: "edit", kind: "form", movement: { id: "1" } },
    ],
    position: 1,
  };
  state = ledgerDialogFlow(state, { type: "completed", key: "edit" });
  assert.equal(state.entries[state.position].key, "parent");
  state = ledgerDialogFlow(state, { type: "close", key: "edit" });
  assert.equal(state.entries[state.position].key, "parent");
});
