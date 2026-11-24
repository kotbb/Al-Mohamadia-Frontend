import type { LedgerMovement } from "./personal-ledger.types";

export type LedgerDialog =
  | { key: string; kind: "contacts" }
  | { key: string; kind: "contact"; id: string }
  | { key: string; kind: "movement"; id: string }
  | { key: string; kind: "form"; movement?: LedgerMovement }
  | { key: string; kind: "delete"; movement: LedgerMovement };
export interface LedgerDialogFlow {
  entries: LedgerDialog[];
  position: number;
}
export type LedgerDialogAction =
  | { type: "push"; entry: LedgerDialog }
  | { type: "back" }
  | { type: "completed"; key: string }
  | { type: "close"; key: string }
  | { type: "hydrate"; state: LedgerDialogFlow }
  | { type: "restore"; key: string }
  | { type: "deleted"; id: string };
export interface LedgerDialogProps {
  open?: boolean;
  active?: boolean;
  nested?: boolean;
  layerKey?: string;
  onClose: () => void;
  onRestore?: () => void;
}
export type LedgerDialogInput = {
  [Kind in LedgerDialog["kind"]]: Omit<Extract<LedgerDialog, { kind: Kind }>, "key">;
}[LedgerDialog["kind"]];
export interface LedgerDialogSessionEntry {
  key: string;
  kind: LedgerDialog["kind"];
  id?: string;
}
export interface LedgerDialogSession {
  entries: LedgerDialogSessionEntry[];
  position: number;
}
