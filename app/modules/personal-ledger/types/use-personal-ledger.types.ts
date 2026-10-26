import type { LedgerPeriod } from "./personal-ledger.types";

export interface LedgerFiltersState {
  q: string;
  period: LedgerPeriod;
  date: string;
  custom: { from: string; to: string };
  page: number;
}
