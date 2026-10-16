import type {
  Item,
  PriceHistoryEntry,
} from "@/app/modules/items/types/items.types";

export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface UsePriceHistoryResult {
  item: Item | null;
  history: PriceHistoryEntry[];
  status: LoadStatus;
  error: string | null;
}
