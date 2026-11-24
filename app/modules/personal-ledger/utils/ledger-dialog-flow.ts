import type { LedgerDialogAction, LedgerDialogFlow } from "../types/ledger-dialog-flow.types";

export function ledgerDialogFlow(state: LedgerDialogFlow, action: LedgerDialogAction): LedgerDialogFlow {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "push":
      return { entries: [...state.entries.slice(0, state.position + 1), action.entry], position: state.position + 1 };
    case "completed": {
      const entries = state.entries.filter((entry) => entry.key !== action.key);
      const previous = state.entries.slice(0, state.position + 1).filter((entry) => entries.includes(entry));
      return { entries, position: previous.length - 1 };
    }
    case "close": {
      const position = state.entries.findIndex((entry) => entry.key === action.key);
      return position < 0 ? state : { ...state, position: Math.min(state.position, position - 1) };
    }
    case "back":
      return { ...state, position: Math.max(-1, state.position - 1) };
    case "restore": {
      const position = state.entries.findIndex((entry) => entry.key === action.key);
      return position < 0 ? state : { ...state, position };
    }
    case "deleted": {
      const entries = state.entries.filter(
        (entry) =>
          !(
            (entry.kind === "movement" && entry.id === action.id) ||
            ((entry.kind === "delete" || entry.kind === "form") && entry.movement?.id === action.id)
          ),
      );
      const previous = state.entries.slice(0, state.position + 1).filter((entry) => entries.includes(entry));
      return { entries, position: previous.length - 1 };
    }
  }
}
